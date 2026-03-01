import { useState, useEffect, useCallback } from 'react'
import { get, set } from 'idb-keyval'
import type { SavedListing } from '../types'
import type { ProcessedImage } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const STORAGE_KEY = 'mercari_saved_listings'

function loadListingsLocal(): Promise<SavedListing[]> {
  return get<SavedListing[]>(STORAGE_KEY).then((data) =>
    Array.isArray(data) ? data : []
  )
}

async function imagesToDataUrls(images: ProcessedImage[]): Promise<string[]> {
  const processed = images.filter((i) => i.processedUrl ?? i.originalUrl)
  const urls: string[] = []
  for (const img of processed) {
    const url = img.processedUrl ?? img.originalUrl
    if (url.startsWith('data:')) {
      urls.push(url)
    } else {
      const res = await fetch(url)
      const blob = await res.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      urls.push(dataUrl)
    }
  }
  return urls
}

function dbRowToListing(row: Record<string, unknown>): SavedListing {
  return {
    id: row.id as string,
    createdAt: (row.created_at as number) ?? 0,
    title: (row.title as string) ?? '',
    description: (row.description as string) ?? '',
    category: (row.category as string) ?? '',
    hashtags: Array.isArray(row.hashtags) ? (row.hashtags as string[]) : [],
    imageDataUrls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
  }
}

export function useSavedListings() {
  const { user } = useAuth()
  const [listings, setListings] = useState<SavedListing[]>([])

  useEffect(() => {
    if (supabase && user) {
      supabase
        .from('saved_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            loadListingsLocal().then(setListings)
            return
          }
          setListings((data ?? []).map(dbRowToListing))
        })
    } else {
      loadListingsLocal().then(setListings)
    }
  }, [user])

  const saveListing = useCallback(
    async (
      images: ProcessedImage[],
      title: string,
      description: string,
      category: string,
      hashtags: string[]
    ): Promise<void> => {
      const imageDataUrls = await imagesToDataUrls(images)
      const listing: SavedListing = {
        id: `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: Date.now(),
        title,
        description,
        category,
        hashtags,
        imageDataUrls,
      }
      const next = [listing, ...listings]
      setListings(next)
      if (supabase && user) {
        const { error } = await supabase.from('saved_listings').insert({
          id: listing.id,
          user_id: user.id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          hashtags: listing.hashtags,
          image_urls: listing.imageDataUrls,
          created_at: listing.createdAt,
        })
        if (error) {
          console.warn('Supabaseへの保存に失敗、IndexedDBにフォールバックします', error)
          await set(STORAGE_KEY, next)
        }
      } else {
        await set(STORAGE_KEY, next)
      }
    },
    [listings, user]
  )

  const deleteListing = useCallback(
    async (id: string) => {
      const next = listings.filter((l) => l.id !== id)
      setListings(next)
      if (supabase && user) {
        const { error } = await supabase.from('saved_listings').delete().eq('id', id).eq('user_id', user.id)
        if (error) console.warn('Supabaseからの削除に失敗', error)
      } else {
        await set(STORAGE_KEY, next)
      }
    },
    [listings, user]
  )

  const refresh = useCallback(() => {
    if (supabase && user) {
      supabase
        .from('saved_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setListings(data.map(dbRowToListing))
        })
    } else {
      loadListingsLocal().then(setListings)
    }
  }, [user])

  return { listings, saveListing, deleteListing, refresh }
}

import { useEffect, useCallback, useState } from 'react'
import { get, set, del } from 'idb-keyval'
import type { ProcessedImage } from '../types'

const STORAGE_KEY = 'mercari_session'

interface StoredImage {
  id: string
  dataUrl: string
  isTopImage: boolean
  brightness: number
  contrast: number
  saturation: number
}

async function imageToStored(img: ProcessedImage): Promise<StoredImage> {
  const url = img.processedUrl ?? img.originalUrl
  const res = await fetch(url)
  const blob = await res.blob()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return {
    id: img.id,
    dataUrl,
    isTopImage: img.isTopImage,
    brightness: img.brightness,
    contrast: img.contrast,
    saturation: img.saturation,
  }
}

async function storedToImage(s: StoredImage): Promise<ProcessedImage> {
  const res = await fetch(s.dataUrl)
  const blob = await res.blob()
  const file = new File([blob], `${s.id}.jpg`, { type: 'image/jpeg' })
  return {
    id: s.id,
    file,
    originalUrl: s.dataUrl,
    processedUrl: s.dataUrl,
    isTopImage: s.isTopImage,
    brightness: s.brightness,
    contrast: s.contrast,
    saturation: s.saturation,
  }
}

export function useSessionPersistence(
  images: ProcessedImage[],
  setImages: (imgs: ProcessedImage[]) => void
) {
  const [hasStored, setHasStored] = useState<boolean | null>(null)

  useEffect(() => {
    get<StoredImage[]>(STORAGE_KEY).then((data) => {
      setHasStored(Array.isArray(data) && data.length > 0)
    })
  }, [])

  useEffect(() => {
    if (images.length === 0) return
    const timer = setTimeout(() => {
      Promise.all(images.map(imageToStored))
        .then((arr) => set(STORAGE_KEY, arr))
        .catch(console.error)
    }, 500)
    return () => clearTimeout(timer)
  }, [images])

  const restore = useCallback(async () => {
    const data = await get<StoredImage[]>(STORAGE_KEY)
    if (!Array.isArray(data) || data.length === 0) return
    const restored = await Promise.all(data.map(storedToImage))
    setImages(restored)
    setHasStored(false)
  }, [setImages])

  const clearStored = useCallback(async () => {
    await del(STORAGE_KEY)
    setHasStored(false)
  }, [])

  return { hasStored, restore, clearStored }
}

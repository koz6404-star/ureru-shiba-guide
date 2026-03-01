import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { SavedListing } from '../types'

async function dataUrlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}

interface SavedListingsPanelProps {
  listings: SavedListing[]
  onDelete: (id: string) => void
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function SavedListingsPanel({ listings, onDelete }: SavedListingsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const copyText = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
  }, [])

  const downloadImages = useCallback(async (listing: SavedListing) => {
    const zip = new JSZip()
    for (let i = 0; i < listing.imageDataUrls.length; i++) {
      const res = await fetch(listing.imageDataUrls[i])
      const blob = await res.blob()
      zip.file(`${String(i + 1).padStart(2, '0')}.jpg`, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `mercari-${listing.title.slice(0, 20)}-images.zip`)
  }, [])

  const shareImages = useCallback(async (listing: SavedListing) => {
    if (!navigator.share || listing.imageDataUrls.length === 0) return
    try {
      const files: File[] = []
      for (let i = 0; i < listing.imageDataUrls.length; i++) {
        files.push(await dataUrlToFile(listing.imageDataUrls[i], `${String(i + 1).padStart(2, '0')}.jpg`))
      }
      if (navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: listing.title || 'メルカリ出品画像',
        })
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err)
    }
  }, [])

  const saveOneImage = useCallback(async (url: string, index: number) => {
    const file = await dataUrlToFile(url, `${String(index + 1).padStart(2, '0')}.jpg`)
    saveAs(file, file.name)
  }, [])

  if (listings.length === 0) return null

  return (
    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
      <h4 className="font-semibold text-slate-700 dark:text-slate-200">
        保存済み出品
      </h4>
      <div className="space-y-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                {listing.title || '（タイトルなし）'}
              </span>
              <span className="text-slate-500 text-sm shrink-0 ml-2">
                {formatDate(listing.createdAt)}
              </span>
            </button>
            {expandedId === listing.id && (
              <div className="px-4 pb-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2 flex-wrap pt-3">
                  <button
                    type="button"
                    onClick={() => downloadImages(listing)}
                    className="touch-target min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium"
                  >
                    画像ZIP
                  </button>
                  {typeof navigator.share === 'function' && (
                    <button
                      type="button"
                      onClick={() => shareImages(listing)}
                      className="touch-target min-h-[36px] px-3 py-1.5 rounded-lg bg-sky-500 text-white text-sm font-medium"
                    >
                      共有
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(listing.id)}
                    className="touch-target min-h-[36px] px-3 py-1.5 rounded-lg text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    削除
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {listing.imageDataUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => saveOneImage(url, i)}
                        className="absolute bottom-1 right-1 touch-target min-h-[28px] px-2 py-0.5 rounded bg-black/60 text-white text-xs"
                      >
                        保存
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">商品名:</span>
                    <span className="text-slate-700 dark:text-slate-300">{listing.title}</span>
                    <button
                      type="button"
                      onClick={() => copyText(listing.title)}
                      className="shrink-0 text-slate-500 hover:text-amber-500"
                    >
                      📋
                    </button>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">商品説明:</span>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-xs max-h-24 overflow-y-auto">
                      {listing.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText(listing.description)}
                      className="mt-1 text-xs text-amber-600 dark:text-amber-400"
                    >
                      コピー
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">カテゴリ:</span>
                    <span className="text-slate-700 dark:text-slate-300">{listing.category}</span>
                    <button
                      type="button"
                      onClick={() => copyText(listing.category)}
                      className="text-slate-500"
                    >
                      📋
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500">ハッシュタグ:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {listing.hashtags.map((h) => `#${h}`).join(' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(listing.hashtags.map((h) => `#${h}`).join(' '))}
                      className="text-slate-500"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

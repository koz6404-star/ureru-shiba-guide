import { useCallback } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ProcessedImage } from '../types'

interface DownloadPanelProps {
  images: ProcessedImage[]
}

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url)
  const blob = await res.blob()
  const ext = url.includes('png') ? 'png' : 'jpg'
  return new File([blob], filename, { type: blob.type || `image/${ext}` })
}

export function DownloadPanel({ images }: DownloadPanelProps) {
  const processed = images.filter((i) => i.processedUrl)

  const handleDownload = useCallback(async () => {
    if (processed.length === 0) return
    const zip = new JSZip()
    for (let i = 0; i < processed.length; i++) {
      const img = processed[i]
      const url = img.processedUrl!
      const res = await fetch(url)
      const blob = await res.blob()
      const ext = img.file.type === 'image/png' ? 'png' : 'jpg'
      zip.file(`${String(i + 1).padStart(2, '0')}.${ext}`, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'mercari-images.zip')
  }, [processed])

  const handleShare = useCallback(async () => {
    if (processed.length === 0 || !navigator.share) return
    try {
      const files: File[] = []
      for (let i = 0; i < processed.length; i++) {
        const url = processed[i].processedUrl!
        files.push(await urlToFile(url, `${String(i + 1).padStart(2, '0')}.jpg`))
      }
      if (navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: 'メルカリ出品画像',
        })
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err)
    }
  }, [processed])

  const handleSaveOne = useCallback(async (url: string, index: number) => {
    const file = await urlToFile(url, `${String(index + 1).padStart(2, '0')}.jpg`)
    saveAs(file, file.name)
  }, [])

  const canDownload = processed.length > 0
  const canShare = canDownload && typeof navigator.share === 'function'

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">
        ダウンロード
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        編集後の画像を保存します。スマホでは「共有」→「写真に保存」も利用できます
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!canDownload}
          className="touch-target min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50 text-sm"
        >
          ZIPで一括
        </button>
        {canShare && (
          <button
            type="button"
            onClick={handleShare}
            className="touch-target min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm"
          >
            共有（写真に保存など）
          </button>
        )}
      </div>
      {canDownload && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            1枚ずつ保存
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {processed.map((img, i) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={img.processedUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveOne(img.processedUrl!, i)}
                  className="absolute bottom-1 right-1 touch-target min-h-[36px] px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-medium"
                >
                  保存
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

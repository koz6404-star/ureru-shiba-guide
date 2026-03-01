import { useCallback, useRef, useState } from 'react'
import { CameraCapture } from './CameraCapture'
import type { ProcessedImage } from '../types'

const ACCEPT_TYPES = 'image/jpeg,image/png'

interface ImageUploaderProps {
  images: ProcessedImage[]
  onImagesChange: (images: ProcessedImage[]) => void
}

function createImageFromFile(file: File, index: number): ProcessedImage {
  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    file,
    originalUrl: URL.createObjectURL(file),
    isTopImage: index === 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
  }
}

export function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)

  const processFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return
    const validFiles = Array.from(files).filter(
      (f) => f.type === 'image/jpeg' || f.type === 'image/png'
    )
    if (validFiles.length === 0) return
    const newImages = validFiles.map((f, i) =>
      createImageFromFile(f, images.length + i)
    )
    const updated = [...images]
    if (updated.length === 0) newImages[0].isTopImage = true
    else newImages[0].isTopImage = false
    onImagesChange([...updated, ...newImages])
  }, [images, onImagesChange])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      processFiles(e.dataTransfer.files)
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files)
      e.target.value = ''
    },
    [processFiles]
  )

  const removeImage = useCallback(
    (id: string) => {
      const next = images.filter((img) => img.id !== id)
      if (next.length > 0 && images.find((i) => i.id === id)?.isTopImage) {
        next[0].isTopImage = true
      }
      onImagesChange(next)
    },
    [images, onImagesChange]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="touch-target flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-amber-500 text-white font-medium active:bg-amber-600 transition-colors text-base"
        >
          連続撮影
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="touch-target flex-1 min-h-[48px] px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 active:bg-slate-100 dark:active:bg-slate-800 transition-colors text-base"
        >
          ファイルから選択
        </button>
      </div>

      {showCamera && (
        <CameraCapture
          existingCount={images.length}
          onCapture={(newImgs) => {
            const merged = [...images, ...newImgs]
            onImagesChange(merged)
            setShowCamera(false)
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 sm:p-8 min-h-[120px] flex flex-col justify-center items-center text-center cursor-pointer transition-colors hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800/50 dark:hover:border-amber-500 active:border-amber-500 active:bg-amber-50/50 dark:active:bg-slate-800/50 dark:active:border-amber-500"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_TYPES}
          capture="environment"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
          ここにドラッグ＆ドロップ または タップして選択
        </p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
          スマホではカメラ撮影も可能（保存せずそのまま取り込み）
        </p>
        <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
          JPG・PNG対応（1枚目がトップ画像）
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm">
                <img
                  src={img.processedUrl ?? img.originalUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {img.isTopImage && (
                <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full">
                  背景除去
                </span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                className="touch-target absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-9 h-9 sm:w-7 sm:h-7 rounded-full bg-red-500/90 text-white text-lg sm:text-sm font-bold flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

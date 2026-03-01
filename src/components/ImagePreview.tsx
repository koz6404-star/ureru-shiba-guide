import type { ProcessedImage } from '../types'

interface ImagePreviewProps {
  images: ProcessedImage[]
}

export function ImagePreview({ images }: ImagePreviewProps) {
  if (images.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">
        処理後プレビュー
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {images.map((img) => (
          <div key={img.id} className="space-y-1">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={img.processedUrl ?? img.originalUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {img.isTopImage && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                トップ画像
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

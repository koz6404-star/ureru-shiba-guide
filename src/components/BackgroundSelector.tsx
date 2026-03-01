import { useCallback } from 'react'
import { BACKGROUND_OPTIONS } from '../constants'
import type { BackgroundType } from '../types'

interface BackgroundSelectorProps {
  selectedBackground: BackgroundType
  customColor: string
  customImageUrl: string
  onBackgroundChange: (id: BackgroundType) => void
  onCustomColorChange: (color: string) => void
  onCustomImageChange: (url: string) => void
  previewUrl: string | null
}

export function BackgroundSelector({
  selectedBackground,
  customColor,
  customImageUrl,
  onBackgroundChange,
  onCustomColorChange,
  onCustomImageChange,
  previewUrl,
}: BackgroundSelectorProps) {
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onCustomImageChange(URL.createObjectURL(file))
    },
    [onCustomImageChange]
  )

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">
        背景設定（トップ画像のみ）
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-2">
        {BACKGROUND_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onBackgroundChange(opt.id)}
            className={`touch-target p-3 sm:p-3 min-h-[72px] rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
              selectedBackground === opt.id
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div
              className="w-full h-8 sm:h-10 rounded mb-1.5"
              style={{
                background: opt.type === 'color' ? opt.value : opt.value,
              }}
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {opt.name}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            カスタムカラー
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                onCustomColorChange(e.target.value)
                onBackgroundChange('custom-color')
              }}
              className="touch-target w-12 h-12 sm:h-10 rounded-xl cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                onCustomColorChange(e.target.value)
                onBackgroundChange('custom-color')
              }}
              className="flex-1 min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              placeholder="#ffffff"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            カスタム画像
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:bg-amber-500 file:text-white file:font-medium file:min-h-[44px]"
          />
          {customImageUrl && (
            <div className="mt-2 w-20 h-20 rounded overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={customImageUrl} alt="選択画像" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            プレビュー
          </p>
          <div className="max-w-xs rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src={previewUrl} alt="プレビュー" className="w-full" />
          </div>
        </div>
      )}
    </div>
  )
}

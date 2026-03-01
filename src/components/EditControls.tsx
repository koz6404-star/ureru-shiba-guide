import type { ImageAdjustments } from '../utils/canvasUtils'

interface EditControlsProps {
  adjustments: ImageAdjustments
  maintainAspectRatio: boolean
  onAdjustmentsChange: (adj: ImageAdjustments) => void
  onMaintainAspectChange: (v: boolean) => void
  onAutoAdjust: () => void
}

export function EditControls({
  adjustments,
  maintainAspectRatio,
  onAdjustmentsChange,
  onMaintainAspectChange,
  onAutoAdjust,
}: EditControlsProps) {
  const update = (key: keyof ImageAdjustments, value: number) => {
    onAdjustmentsChange({ ...adjustments, [key]: value })
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">
        画像編集（全画像一括）
      </h3>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">明るさ</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {adjustments.brightness}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.brightness}
            onChange={(e) => update('brightness', Number(e.target.value))}
            className="w-full h-3 sm:h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-amber-500"
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">コントラスト</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {adjustments.contrast}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.contrast}
            onChange={(e) => update('contrast', Number(e.target.value))}
            className="w-full h-3 sm:h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-amber-500"
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">彩度</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {adjustments.saturation}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.saturation}
            onChange={(e) => update('saturation', Number(e.target.value))}
            className="w-full h-3 sm:h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-amber-500"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onAutoAdjust}
        className="touch-target min-h-[44px] px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium active:bg-slate-300 dark:active:bg-slate-600 transition-colors"
      >
        自動補正
      </button>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-3">
          リサイズ（メルカリ推奨 1200×1200px）
        </h4>
        <label className="flex items-center gap-3 cursor-pointer touch-target min-h-[44px]">
          <input
            type="checkbox"
            checked={maintainAspectRatio}
            onChange={(e) => onMaintainAspectChange(e.target.checked)}
            className="w-5 h-5 rounded accent-amber-500"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            アスペクト比を維持
          </span>
        </label>
      </div>
    </div>
  )
}

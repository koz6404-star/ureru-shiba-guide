import { useState } from 'react'
import type { EditPreset } from '../types'

interface PresetSelectorProps {
  presets: EditPreset[]
  selectedPresetId: string | null
  onSelect: (id: string | null) => void
  onSaveNew: (name: string) => void
  onOverwrite: (id: string) => void
  onDelete: (id: string) => void
}

export function PresetSelector({
  presets,
  selectedPresetId,
  onSelect,
  onSaveNew,
  onOverwrite,
  onDelete,
}: PresetSelectorProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')

  const handleSaveNew = () => {
    const name = newPresetName.trim()
    if (name) {
      onSaveNew(name)
      setNewPresetName('')
      setSaveModalOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">
        編集パターン
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        商品カテゴリ別の設定を保存して、次回から選んで適用できます（アクセサリー・衣類など）
      </p>

      {presets.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-500">
          背景・補正を設定し、「新規パターンとして保存」で保存できます
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`touch-target min-h-[40px] px-4 py-2 rounded-xl border-2 font-medium text-sm transition-colors ${
            !selectedPresetId
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
              : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
          }`}
        >
          なし
        </button>
        {presets.map((p) => (
          <div key={p.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(selectedPresetId === p.id ? null : p.id)}
              className={`touch-target min-h-[40px] px-4 py-2 rounded-xl border-2 font-medium text-sm transition-colors ${
                selectedPresetId === p.id
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              }`}
            >
              {p.name}
            </button>
            {selectedPresetId === p.id && (
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                className="touch-target w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center"
                title="削除"
              >
                🗑
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSaveModalOpen(true)}
          className="touch-target min-h-[40px] px-4 py-2 rounded-xl bg-amber-500 text-white font-medium text-sm"
        >
          ＋ 新規パターンとして保存
        </button>
        {selectedPresetId && (
          <button
            type="button"
            onClick={() => selectedPresetId && onOverwrite(selectedPresetId)}
            className="touch-target min-h-[40px] px-4 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 font-medium text-sm"
          >
            上書き保存
          </button>
        )}
      </div>

      {saveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setSaveModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2">
              パターン名を入力
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              例：アクセサリー、衣類、雑貨 など
            </p>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="パターン名"
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="touch-target flex-1 min-h-[44px] rounded-xl border-2 border-slate-300 dark:border-slate-600 font-medium"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveNew}
                disabled={!newPresetName.trim()}
                className="touch-target flex-1 min-h-[44px] rounded-xl bg-amber-500 text-white font-medium disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

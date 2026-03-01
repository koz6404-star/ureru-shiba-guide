import { useState, useCallback } from 'react'
import { generateProductDescription } from '../hooks/useClaudeAPI'
import { SavedListingsPanel } from './SavedListingsPanel'
import type { ProcessedImage, SavedListing } from '../types'

interface DescriptionGeneratorProps {
  images: ProcessedImage[]
  apiKey: string
  onApiKeyPrompt?: () => void
  listings: SavedListing[]
  onSaveListing: (images: ProcessedImage[], title: string, description: string, category: string, hashtags: string[]) => Promise<void>
  onDeleteListing: (id: string) => void
}

export function DescriptionGenerator({ images, apiKey, onApiKeyPrompt, listings, onSaveListing, onDeleteListing }: DescriptionGeneratorProps) {
  const [result, setResult] = useState<{
    title: string
    description: string
    category: string
    hashtags: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
  }, [])

  const handleGenerate = useCallback(async () => {
    const topImage = images.find((i) => i.isTopImage) ?? images[0]
    const imageUrl = topImage?.processedUrl ?? topImage?.originalUrl
    if (!imageUrl) {
      setError('画像がありません')
      return
    }

    if (!apiKey) {
      onApiKeyPrompt?.()
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await generateProductDescription(imageUrl, apiKey)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [images, onApiKeyPrompt])

  const topImage = images.find((i) => i.isTopImage) ?? images[0]
  const canGenerate = topImage && (topImage.processedUrl ?? topImage.originalUrl)
  const [saving, setSaving] = useState(false)

  const handleSaveListing = useCallback(async () => {
    if (!result) return
    const processedImages = images.filter((i) => i.processedUrl ?? i.originalUrl)
    if (processedImages.length === 0) return
    setSaving(true)
    try {
      await onSaveListing(
        processedImages,
        result.title,
        result.description,
        result.category,
        result.hashtags
      )
    } finally {
      setSaving(false)
    }
  }, [images, result, onSaveListing])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">
        商品説明文生成
      </h3>

      {canGenerate ? (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="touch-target w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-600 text-white font-medium disabled:opacity-50 transition-colors text-base"
          >
            {loading ? '生成中...' : '説明文を生成'}
          </button>
          {result && (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="touch-target min-h-[44px] px-5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
              >
                再生成
              </button>
              <button
                type="button"
                onClick={handleSaveListing}
                disabled={saving}
                className="touch-target min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-medium disabled:opacity-50"
              >
                {saving ? '保存中...' : 'この出品を保存'}
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          画像をアップロードし、一括処理を実行してください
        </p>
      )}

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}

      {result && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <ResultItem
            label="商品名（40文字以内）"
            value={result.title}
            onCopy={copyToClipboard}
          />
          <ResultItem
            label={`商品説明文（${result.description.length}/1000文字）`}
            value={result.description}
            onCopy={copyToClipboard}
            multiline
          />
          <ResultItem
            label="カテゴリ提案"
            value={result.category}
            onCopy={copyToClipboard}
          />
          <ResultItem
            label="ハッシュタグ"
            value={result.hashtags.map((h) => `#${h}`).join(' ')}
            onCopy={copyToClipboard}
          />
        </div>
      )}

      <SavedListingsPanel listings={listings} onDelete={onDeleteListing} />
    </div>
  )
}

function ResultItem({
  label,
  value,
  onCopy,
  multiline = false,
}: {
  label: string
  value: string
  onCopy: (t: string) => void
  multiline?: boolean
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="touch-target min-w-[44px] min-h-[44px] flex items-center justify-center text-xl active:scale-95 transition-transform -m-2 p-2"
          title="コピー"
        >
          📋
        </button>
      </div>
      {multiline ? (
        <p className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm sm:text-sm whitespace-pre-wrap leading-relaxed">
          {value}
        </p>
      ) : (
        <p className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm">
          {value}
        </p>
      )}
    </div>
  )
}


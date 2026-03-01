import { useState, useCallback } from 'react'
import { ImageUploader } from './components/ImageUploader'
import { useSessionPersistence } from './hooks/useSessionPersistence'
import { useEditPresets } from './hooks/useEditPresets'
import { useApiKey } from './hooks/useApiKey'
import { useSavedListings } from './hooks/useSavedListings'
import { PresetSelector } from './components/PresetSelector'
import { BackgroundSelector } from './components/BackgroundSelector'
import { EditControls } from './components/EditControls'
import { ImagePreview } from './components/ImagePreview'
import { DescriptionGenerator } from './components/DescriptionGenerator'
import { DownloadPanel } from './components/DownloadPanel'
import { SettingsModal } from './components/SettingsModal'
import { FaqModal } from './components/FaqModal'
import { useImageProcessor } from './hooks/useImageProcessor'
import type { ProcessedImage } from './types'

const STEPS = [
  { id: 1, label: '画像アップロード' },
  { id: 2, label: '編集設定' },
  { id: 3, label: '一括処理' },
  { id: 4, label: '説明文生成' },
  { id: 5, label: 'ダウンロード' },
]

export default function App() {
  const [step, setStep] = useState(1)
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)

  const {
    presets,
    selectedPresetId,
    selectedBackground,
    setSelectedBackground,
    customColor,
    setCustomColor,
    customImageUrl,
    setCustomImageUrl,
    adjustments,
    setAdjustments,
    maintainAspectRatio,
    setMaintainAspectRatio,
    selectPresetById,
    saveAsNewPreset,
    overwritePreset,
    deletePreset,
  } = useEditPresets()

  const { processAll, progress, isProcessing } = useImageProcessor(
    images,
    setImages,
    selectedBackground,
    customColor,
    customImageUrl,
    adjustments,
    maintainAspectRatio
  )

  const { hasStored, restore, clearStored } = useSessionPersistence(images, setImages)
  const { listings, saveListing, deleteListing } = useSavedListings()
  const { apiKey } = useApiKey()

  const onAutoAdjust = useCallback(() => {
    setAdjustments({ brightness: 10, contrast: 15, saturation: 5 })
  }, [])

  const topImage = images.find((i) => i.isTopImage)
  const topProcessedUrl = topImage?.processedUrl ?? topImage?.originalUrl

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
              売れる柴ガイド
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              フリマアプリ出品補助ツール
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="touch-target p-3 -m-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 active:bg-slate-300 dark:active:bg-slate-700 transition-colors"
            title="設定"
          >
            ⚙️
          </button>
        </div>
      </header>

      {hasStored && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <span className="text-amber-800 dark:text-amber-200 text-sm">
              前回の作業が保存されています
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={clearStored}
                className="touch-target px-3 flex items-center text-sm text-slate-600 dark:text-slate-400 active:underline"
              >
                破棄
              </button>
              <button
                type="button"
                onClick={restore}
                className="touch-target px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium active:bg-amber-600"
              >
                復元
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-x-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 min-w-0">
          <div className="flex gap-1.5 sm:gap-2 pb-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`touch-target shrink-0 px-4 py-3 sm:px-3 sm:py-2 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] ${
                  step === s.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* STEP 1 */}
        {step === 1 && (
          <section className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">
              1. 画像アップロード
            </h2>
            <ImageUploader images={images} onImagesChange={setImages} />
          </section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <section className="space-y-8">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">
              2. 編集設定
            </h2>
            {images.length > 0 ? (
              <>
                <PresetSelector
                  presets={presets}
                  selectedPresetId={selectedPresetId}
                  onSelect={selectPresetById}
                  onSaveNew={saveAsNewPreset}
                  onOverwrite={overwritePreset}
                  onDelete={deletePreset}
                />
                <BackgroundSelector
                  selectedBackground={selectedBackground}
                  customColor={customColor}
                  customImageUrl={customImageUrl}
                  onBackgroundChange={setSelectedBackground}
                  onCustomColorChange={setCustomColor}
                  onCustomImageChange={setCustomImageUrl}
                  previewUrl={topProcessedUrl ?? null}
                />
                <EditControls
                  adjustments={adjustments}
                  maintainAspectRatio={maintainAspectRatio}
                  onAdjustmentsChange={setAdjustments}
                  onMaintainAspectChange={setMaintainAspectRatio}
                  onAutoAdjust={onAutoAdjust}
                />
                <ImagePreview images={images} />
              </>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                まずSTEP 1で画像をアップロードしてください
              </p>
            )}
          </section>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <section className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">
              3. 一括処理
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              全画像を一括で編集（背景除去・補正・リサイズ）し、自動で保存します
            </p>
            {images.length > 0 ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={processAll}
                  disabled={isProcessing}
                  className="touch-target w-full sm:w-auto px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-600 text-white font-medium disabled:opacity-50 transition-colors text-base"
                >
                  {isProcessing ? '処理中...' : '一括処理開始'}
                </button>
                {isProcessing && (
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                <ImagePreview images={images} />
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                まずSTEP 1で画像をアップロードしてください
              </p>
            )}
          </section>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <section className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">
              4. 商品説明文生成
            </h2>
            <DescriptionGenerator
              images={images}
              apiKey={apiKey}
              onApiKeyPrompt={() => setSettingsOpen(true)}
              listings={listings}
              onSaveListing={saveListing}
              onDeleteListing={deleteListing}
            />
          </section>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <section className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">
              5. ダウンロード
            </h2>
            <DownloadPanel images={images} />
          </section>
        )}
      </main>

      <button
        type="button"
        onClick={() => setFaqOpen(true)}
        className="fixed left-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 w-12 h-12 rounded-full shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center hover:bg-white/90 dark:hover:bg-slate-700/90 active:scale-95 transition-transform"
        title="Q&A"
      >
        <img
          src="/faq-icon.png"
          alt="Q&A"
          className="w-8 h-8 object-contain"
        />
      </button>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <FaqModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
    </div>
  )
}

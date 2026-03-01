import { useCallback, useState } from 'react'
import { removeBackground } from '../utils/backgroundRemoval'
import {
  applyImageAdjustments,
  resizeToMercariSize,
  compositeOnBackground,
  type ImageAdjustments,
} from '../utils/canvasUtils'
import { BACKGROUND_OPTIONS } from '../constants'
import type { ProcessedImage } from '../types'
import type { BackgroundType } from '../types'

export function useImageProcessor(
  images: ProcessedImage[],
  setImages: (images: ProcessedImage[]) => void,
  selectedBackground: BackgroundType,
  customColor: string,
  customImageUrl: string,
  adjustments: ImageAdjustments,
  maintainAspectRatio: boolean
) {
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const getBackgroundValue = useCallback((): { value: string; type: 'color' | 'image' } => {
    if (selectedBackground === 'custom-color') {
      return { value: customColor || '#ffffff', type: 'color' }
    }
    if (selectedBackground === 'custom-image' && customImageUrl) {
      return { value: customImageUrl, type: 'image' }
    }
    const opt = BACKGROUND_OPTIONS.find((o) => o.id === selectedBackground)
    if (opt?.type === 'color') return { value: opt.value, type: 'color' }
    return { value: opt?.value ?? '#ffffff', type: 'color' }
  }, [selectedBackground, customColor, customImageUrl])

  const processAll = useCallback(async () => {
    if (images.length === 0) return
    setIsProcessing(true)
    setProgress(0)
    const total = images.length
    let done = 0

    const updateProgress = () => {
      done++
      setProgress(Math.round((done / total) * 100))
    }

    const processed: ProcessedImage[] = []
    const bg = getBackgroundValue()

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      let url = img.originalUrl

      try {
        // 1. 編集適用（全画像一括設定）
        url = await applyImageAdjustments(url, adjustments)

        // 2. トップ画像のみ背景除去＋合成
        if (img.isTopImage) {
          const bgRemoved = await removeBackground(url)
          url = await compositeOnBackground(bgRemoved, bg.value, bg.type)
        }

        // 3. リサイズ
        url = await resizeToMercariSize(url, maintainAspectRatio)

        processed.push({
          ...img,
          processedUrl: url,
        })
      } catch (err) {
        console.error('画像処理エラー:', err)
        processed.push({ ...img })
      }
      updateProgress()
    }

    setImages(processed)
    setProgress(100)
    setIsProcessing(false)
  }, [
    images,
    setImages,
    getBackgroundValue,
    maintainAspectRatio,
    adjustments,
  ])

  return { processAll, progress, isProcessing }
}

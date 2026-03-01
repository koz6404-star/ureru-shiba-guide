import { useEffect, useRef, useCallback, useState } from 'react'
import type { ProcessedImage } from '../types'

interface CameraCaptureProps {
  onClose: () => void
  onCapture: (images: ProcessedImage[]) => void
  existingCount: number
}

function createImageFromBlob(blob: Blob, idSuffix: number, isTopImage: boolean): ProcessedImage {
  const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
  return {
    id: `${Date.now()}-${idSuffix}-${Math.random().toString(36).slice(2)}`,
    file,
    originalUrl: URL.createObjectURL(blob),
    isTopImage,
    brightness: 0,
    contrast: 0,
    saturation: 0,
  }
}

export function CameraCapture({ onClose, onCapture, existingCount }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [captured, setCaptured] = useState<ProcessedImage[]>([])
  const [error, setError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        setError('カメラにアクセスできません')
      }
    }
    startCamera()
    return () => stopCamera()
  }, [stopCamera])

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const isFirstOverall = existingCount === 0 && captured.length === 0
        const img = createImageFromBlob(blob, existingCount + captured.length, isFirstOverall)
        setCaptured((prev) => [...prev, img])
      },
      'image/jpeg',
      0.92
    )
  }, [existingCount, captured.length])

  const handleDone = useCallback(() => {
    stopCamera()
    if (captured.length > 0) onCapture(captured)
    onClose()
  }, [stopCamera, captured, onCapture, onClose])

  const handleCancel = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="flex-1 w-full object-cover"
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
          <p>{error}</p>
        </div>
      )}

      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/80 flex flex-col gap-4">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!!error}
            className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-slate-300 flex-shrink-0 active:scale-95 transition-transform"
          />
        </div>
        {captured.length > 0 && (
          <p className="text-white text-center text-base">
            撮影済み: {captured.length}枚
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="touch-target flex-1 min-h-[48px] py-3 rounded-xl bg-slate-600 text-white font-medium active:bg-slate-500"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="touch-target flex-1 min-h-[48px] py-3 rounded-xl bg-amber-500 text-white font-medium active:bg-amber-600"
          >
            {captured.length > 0 ? `${captured.length}枚を追加` : '終了'}
          </button>
        </div>
      </div>
    </div>
  )
}

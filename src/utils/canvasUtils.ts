const MERCARI_SIZE = 1200

export interface ImageAdjustments {
  brightness: number
  contrast: number
  saturation: number
}

export async function applyImageAdjustments(
  imageUrl: string,
  adjustments: ImageAdjustments
): Promise<string> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = imageUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const { brightness, contrast, saturation } = adjustments
  const brightnessFactor = (brightness + 100) / 100
  const contrastFactor = (contrast + 100) / 100
  const satFactor = (saturation + 100) / 100

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    // 彩度
    if (satFactor !== 1) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b
      r = gray + (r - gray) * satFactor
      g = gray + (g - gray) * satFactor
      b = gray + (b - gray) * satFactor
    }

    // コントラスト
    if (contrastFactor !== 1) {
      const mid = 128
      r = mid + (r - mid) * contrastFactor
      g = mid + (g - mid) * contrastFactor
      b = mid + (b - mid) * contrastFactor
    }

    // 明るさ
    r = Math.min(255, Math.max(0, r * brightnessFactor))
    g = Math.min(255, Math.max(0, g * brightnessFactor))
    b = Math.min(255, Math.max(0, b * brightnessFactor))

    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.92)
}

export async function resizeToMercariSize(
  imageUrl: string,
  maintainAspectRatio = false
): Promise<string> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = imageUrl
  })

  let width = img.naturalWidth
  let height = img.naturalHeight

  if (maintainAspectRatio) {
    const scale = Math.min(MERCARI_SIZE / width, MERCARI_SIZE / height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  } else {
    width = MERCARI_SIZE
    height = MERCARI_SIZE
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.92)
}

export async function compositeOnBackground(
  foregroundUrl: string,
  backgroundValue: string,
  backgroundType: 'color' | 'image'
): Promise<string> {
  const fgImg = new Image()
  fgImg.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    fgImg.onload = () => resolve()
    fgImg.onerror = reject
    fgImg.src = foregroundUrl
  })

  const size = Math.max(fgImg.naturalWidth, fgImg.naturalHeight, MERCARI_SIZE)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  if (backgroundType === 'color') {
    ctx.fillStyle = backgroundValue
    ctx.fillRect(0, 0, size, size)
  } else {
    const bgImg = new Image()
    bgImg.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      bgImg.onload = () => resolve()
      bgImg.onerror = reject
      bgImg.src = backgroundValue
    })
    const pattern = ctx.createPattern(bgImg, 'repeat')
    if (pattern) {
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, size, size)
    }
  }

  const offsetX = (size - fgImg.naturalWidth) / 2
  const offsetY = (size - fgImg.naturalHeight) / 2
  ctx.drawImage(fgImg, offsetX, offsetY)

  return canvas.toDataURL('image/jpeg', 0.92)
}

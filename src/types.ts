export interface ProcessedImage {
  id: string
  file: File
  originalUrl: string
  processedUrl?: string
  isTopImage: boolean
  brightness: number
  contrast: number
  saturation: number
}

export type BackgroundType =
  | 'white' | 'offwhite' | 'lightgray' | 'charcoal' | 'black'
  | 'natural-wood' | 'dark-walnut' | 'cafe-board' | 'herringbone'
  | 'white-marble' | 'black-marble' | 'concrete' | 'linen'
  | 'custom-color' | 'custom-image'

export interface BackgroundOption {
  id: BackgroundType
  name: string
  value: string
  type: 'color' | 'texture' | 'custom'
}

export interface ProductDescription {
  title: string
  description: string
  category: string
  hashtags: string[]
}

export interface SavedListing {
  id: string
  createdAt: number
  title: string
  description: string
  category: string
  hashtags: string[]
  imageDataUrls: string[]
}

export interface EditPreset {
  id: string
  name: string
  selectedBackground: BackgroundType
  customColor: string
  customImageDataUrl: string | null
  adjustments: {
    brightness: number
    contrast: number
    saturation: number
  }
  maintainAspectRatio: boolean
  createdAt: number
}

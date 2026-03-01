import type { BackgroundOption } from './types'

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  // シンプル系
  { id: 'white', name: '白', value: '#ffffff', type: 'color' },
  { id: 'offwhite', name: 'オフホワイト', value: '#f5f5f0', type: 'color' },
  { id: 'lightgray', name: 'ライトグレー', value: '#e8e8e8', type: 'color' },
  { id: 'charcoal', name: 'チャコール', value: '#36454f', type: 'color' },
  { id: 'black', name: '黒', value: '#1a1a1a', type: 'color' },
  // 木・カフェ系
  { id: 'natural-wood', name: 'ナチュラル木目', value: '#c4956a', type: 'texture' },
  { id: 'dark-walnut', name: 'ダークウォールナット', value: '#3d2914', type: 'texture' },
  { id: 'cafe-board', name: 'カフェ板風', value: '#7a5a12', type: 'texture' },
  { id: 'herringbone', name: 'ヘリンボーン', value: '#c4a574', type: 'texture' },
  // テクスチャ系
  { id: 'white-marble', name: '白大理石', value: '#f0f0f0', type: 'texture' },
  { id: 'black-marble', name: '黒大理石', value: '#2a2a2a', type: 'texture' },
  { id: 'concrete', name: 'コンクリート', value: '#9e9e9e', type: 'color' },
  { id: 'linen', name: 'リネン', value: '#f5e6d3', type: 'color' },
]

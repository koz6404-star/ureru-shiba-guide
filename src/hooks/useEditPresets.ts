import { useState, useEffect, useCallback } from 'react'
import type { BackgroundType } from '../types'
import type { EditPreset } from '../types'
import type { ImageAdjustments } from '../utils/canvasUtils'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const STORAGE_KEY = 'mercari_edit_presets'

const DEFAULT_SETTINGS = {
  selectedBackground: 'white' as BackgroundType,
  customColor: '#ffffff',
  customImageDataUrl: null as string | null,
  adjustments: { brightness: 0, contrast: 0, saturation: 0 } as ImageAdjustments,
  maintainAspectRatio: false,
}

function loadPresetsLocal(): EditPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (p): p is EditPreset =>
        p && typeof p.id === 'string' && typeof p.name === 'string'
    )
  } catch {
    return []
  }
}

function savePresetsLocal(presets: EditPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
  } catch (e) {
    console.warn('プリセットの保存に失敗しました', e)
  }
}

function presetToSettings(p: EditPreset) {
  return {
    selectedBackground: p.selectedBackground,
    customColor: p.customColor,
    customImageDataUrl: p.customImageDataUrl,
    adjustments: p.adjustments,
    maintainAspectRatio: p.maintainAspectRatio,
  }
}

function dbRowToPreset(row: Record<string, unknown>): EditPreset {
  return {
    id: row.id as string,
    name: row.name as string,
    selectedBackground: (row.selected_background as string) as BackgroundType,
    customColor: (row.custom_color as string) ?? '#ffffff',
    customImageDataUrl: (row.custom_image_data_url as string) ?? null,
    adjustments: (row.adjustments as ImageAdjustments) ?? DEFAULT_SETTINGS.adjustments,
    maintainAspectRatio: !!row.maintain_aspect_ratio,
    createdAt: (row.created_at as number) ?? Date.now(),
  }
}

function presetToDbRow(p: EditPreset) {
  return {
    id: p.id,
    name: p.name,
    selected_background: p.selectedBackground,
    custom_color: p.customColor,
    custom_image_data_url: p.customImageDataUrl,
    adjustments: p.adjustments,
    maintain_aspect_ratio: p.maintainAspectRatio,
    created_at: p.createdAt,
  }
}

export function useEditPresets() {
  const { user } = useAuth()
  const [presets, setPresets] = useState<EditPreset[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [selectedBackground, setSelectedBackground] = useState<BackgroundType>(DEFAULT_SETTINGS.selectedBackground)
  const [customColor, setCustomColor] = useState(DEFAULT_SETTINGS.customColor)
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_SETTINGS.adjustments)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(DEFAULT_SETTINGS.maintainAspectRatio)

  useEffect(() => {
    if (supabase && user) {
      supabase
        .from('edit_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            setPresets(loadPresetsLocal())
            return
          }
          setPresets((data ?? []).map(dbRowToPreset))
        })
    } else {
      setPresets(loadPresetsLocal())
    }
  }, [user])

  const syncToSupabase = useCallback(async (presetsToSync: EditPreset[]) => {
    if (!supabase || !user) return
    try {
      const rows = presetsToSync.map((p) => ({
        ...presetToDbRow(p),
        user_id: user.id,
      }))
      const idsToKeep = new Set(presetsToSync.map((p) => p.id))
      const { data: existing } = await supabase
        .from('edit_presets')
        .select('id')
        .eq('user_id', user.id)
      const toDelete = (existing ?? []).filter((r) => !idsToKeep.has(r.id)).map((r) => r.id)
      if (toDelete.length > 0) {
        await supabase.from('edit_presets').delete().in('id', toDelete)
      }
      if (rows.length > 0) {
        await supabase.from('edit_presets').upsert(rows)
      }
    } catch (e) {
      console.warn('Supabaseへのプリセット同期に失敗', e)
    }
  }, [user])

  const applyPreset = useCallback((preset: EditPreset) => {
    const s = presetToSettings(preset)
    setSelectedBackground(s.selectedBackground)
    setCustomColor(s.customColor)
    setCustomImageUrl(s.customImageDataUrl ?? '')
    setAdjustments(s.adjustments)
    setMaintainAspectRatio(s.maintainAspectRatio)
    setSelectedPresetId(preset.id)
  }, [])

  const selectPresetById = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedBackground(DEFAULT_SETTINGS.selectedBackground)
        setCustomColor(DEFAULT_SETTINGS.customColor)
        setCustomImageUrl('')
        setAdjustments(DEFAULT_SETTINGS.adjustments)
        setMaintainAspectRatio(DEFAULT_SETTINGS.maintainAspectRatio)
        setSelectedPresetId(null)
        return
      }
      const p = presets.find((x) => x.id === id)
      if (p) applyPreset(p)
    },
    [presets, applyPreset]
  )

  const saveAsNewPreset = useCallback(
    (name: string) => {
      const customImageDataUrl =
        customImageUrl && customImageUrl.startsWith('data:') ? customImageUrl : null
      const preset: EditPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        selectedBackground,
        customColor,
        customImageDataUrl,
        adjustments,
        maintainAspectRatio,
        createdAt: Date.now(),
      }
      const next = [...presets, preset]
      setPresets(next)
      savePresetsLocal(next)
      syncToSupabase(next)
      setSelectedPresetId(preset.id)
    },
    [presets, selectedBackground, customColor, customImageUrl, adjustments, maintainAspectRatio, syncToSupabase]
  )

  const overwritePreset = useCallback(
    (id: string) => {
      const customImageDataUrl =
        customImageUrl && customImageUrl.startsWith('data:') ? customImageUrl : null
      const idx = presets.findIndex((p) => p.id === id)
      if (idx < 0) return
      const updated: EditPreset = {
        ...presets[idx],
        selectedBackground,
        customColor,
        customImageDataUrl,
        adjustments,
        maintainAspectRatio,
      }
      const next = [...presets]
      next[idx] = updated
      setPresets(next)
      savePresetsLocal(next)
      syncToSupabase(next)
    },
    [presets, selectedBackground, customColor, customImageUrl, adjustments, maintainAspectRatio, syncToSupabase]
  )

  const deletePreset = useCallback((id: string) => {
    const next = presets.filter((p) => p.id !== id)
    setPresets(next)
    savePresetsLocal(next)
    syncToSupabase(next)
    if (selectedPresetId === id) {
      selectPresetById(null)
    }
  }, [presets, selectedPresetId, selectPresetById, syncToSupabase])

  const setCustomImageUrlWithConvert = useCallback((url: string) => {
    if (!url) {
      setCustomImageUrl('')
      return
    }
    setCustomImageUrl(url)
    if (!url.startsWith('data:')) {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        )
        .then((dataUrl) => setCustomImageUrl(dataUrl))
        .catch(() => {})
    }
  }, [])

  const selectedPreset = selectedPresetId ? presets.find((p) => p.id === selectedPresetId) : null

  return {
    presets,
    selectedPresetId,
    selectedPreset,
    selectedBackground,
    setSelectedBackground,
    customColor,
    setCustomColor,
    customImageUrl,
    setCustomImageUrl: setCustomImageUrlWithConvert,
    adjustments,
    setAdjustments,
    maintainAspectRatio,
    setMaintainAspectRatio,
    applyPreset,
    selectPresetById,
    saveAsNewPreset,
    overwritePreset,
    deletePreset,
  }
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const LOCAL_STORAGE_KEY = 'mercari_claude_api_key'

export function useApiKey() {
  const { user } = useAuth()
  const [apiKey, setApiKeyState] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (supabase && user) {
        try {
          const { data } = await supabase
            .from('user_settings')
            .select('api_key')
            .eq('user_id', user.id)
            .maybeSingle()
          setApiKeyState(data?.api_key ?? '')
        } catch {
          setApiKeyState(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '')
        }
      } else {
        setApiKeyState(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '')
      }
      setLoading(false)
    }
    load()
  }, [user])

  const setApiKey = useCallback(async (key: string) => {
    if (supabase && user) {
      try {
        await supabase.from('user_settings').upsert(
          { user_id: user.id, api_key: key, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      } catch (e) {
        console.warn('APIキーの保存に失敗、localStorageにフォールバック', e)
        localStorage.setItem(LOCAL_STORAGE_KEY, key)
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, key)
    }
    setApiKeyState(key)
  }, [user])

  return { apiKey, setApiKey, loading }
}

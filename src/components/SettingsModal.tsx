import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApiKey } from '../hooks/useApiKey'
import { AuthModal } from './AuthModal'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, signOut } = useAuth()
  const { apiKey, setApiKey } = useApiKey()
  const [localKey, setLocalKey] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    if (isOpen) setLocalKey(apiKey)
  }, [isOpen, apiKey])

  const handleSave = async () => {
    await setApiKey(localKey)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            設定
          </h2>

          {user ? (
            <div className="mb-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50">
              <p className="text-sm text-slate-600 dark:text-slate-400">ログイン中</p>
              <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                {user.email}
              </p>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm text-amber-600 dark:text-amber-400 mt-1"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                ログインするとAPIキー・プリセット・保存出品が端末間で同期されます
              </p>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                className="text-sm font-medium text-amber-600 dark:text-amber-500"
              >
                ログイン
              </button>
              <span className="text-slate-400 mx-1">/</span>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
                className="text-sm font-medium text-amber-600 dark:text-amber-500"
              >
                新規登録
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Anthropic Claude APIキー
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
              {user ? 'アカウントに保存されます（端末間で同期）' : 'ログインするとアカウントに保存されます'}
            </p>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="touch-target flex-1 min-h-[48px] px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="touch-target flex-1 min-h-[48px] px-4 py-3 rounded-xl bg-amber-500 text-white font-medium active:bg-amber-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </>
  )
}

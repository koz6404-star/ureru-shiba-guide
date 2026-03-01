import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { signIn, signUp } = useAuth()

  const reset = () => {
    setEmail('')
    setPassword('')
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        onClose()
        reset()
      } else {
        await signUp(email, password)
        setMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          {mode === 'login' ? 'ログイン' : 'アカウント登録'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              placeholder="6文字以上"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-emerald-600 dark:text-emerald-400 text-sm">{message}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
              className="text-sm text-slate-500 hover:underline"
            >
              {mode === 'login' ? '新規登録' : 'ログイン'}はこちら
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full touch-target min-h-[48px] rounded-xl bg-amber-500 text-white font-medium disabled:opacity-50"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録'}
          </button>
        </form>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-2 text-slate-500 text-sm"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

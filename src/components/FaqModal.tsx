const FAQ_ITEMS = [
  {
    q: 'APIキーとは？',
    a: 'Anthropic Claude の API キーです。説明文の自動生成に使います。',
  },
  {
    q: 'APIキーはどこで取得する？',
    a: 'console.anthropic.com にログイン → API Keys → Create Key。表示されたキーをコピー（一度しか表示されません）。',
  },
  {
    q: 'APIキーはどこに入力する？',
    a: '設定（⚙️）→ Anthropic Claude APIキーの欄に貼り付け → 保存。1回保存すれば次回から不要です。',
  },
  {
    q: '料金は誰が払う？',
    a: '使う人が払います。あなたのキーを使うとあなたに、パートナーのキーを使うとパートナーに課金されます。',
  },
  {
    q: 'パートナーに自分のキーを共有すると？',
    a: '全員分の料金があなたのアカウントにまとめて請求されます。料金を分けたい場合は各自のキーを使ってもらってください。',
  },
  {
    q: '料金の目安は？',
    a: '説明文1件あたり 数円〜数十円程度。詳しくは Anthropic の料金ページで確認できます。',
  },
  {
    q: 'ログインすると何ができる？',
    a: 'APIキー・プリセット・保存出品が端末間で同期されます。スマホとPCで同じデータが使えます。',
  },
  {
    q: '新規登録の手順は？',
    a: '設定 → 新規登録 → メールとパスワードを入力 → 届いたメールの確認リンクをクリック。',
  },
  {
    q: '説明文が生成されない',
    a: 'APIキーが正しく保存されているか設定で確認してください。',
  },
  {
    q: 'ログインできない',
    a: '登録後、メールの確認リンクをクリックして完了しているか確認してください。',
  },
]

interface FaqModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Q&A</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4"
            >
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                Q. {item.q}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

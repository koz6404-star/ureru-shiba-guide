const API_KEY_STORAGE = 'mercari_claude_api_key'

export function getStoredApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) ?? ''
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key)
}

export async function generateProductDescription(
  imageDataUrl: string,
  apiKey: string
): Promise<{
  title: string
  description: string
  category: string
  hashtags: string[]
}> {
  const base64 = imageDataUrl.split(',')[1]
  if (!base64) throw new Error('画像データが不正です')

  const res = await fetch(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: `この画像はメルカリの出品画像です。以下をJSON形式で出力してください。日本語で答えてください。

1. title: 商品名（必ず40文字以内、簡潔で購買意欲をそそるキャッチーな表現）
2. description: 商品説明文（1000文字以内で、以下の内容を含む）
   - 商品の状態・特徴の詳細
   - 素材・サイズ・カラーなどの細かい説明
   - 購入者が安心できるよう丁寧な説明
   - 配送・注意事項
   - 検索に役立つ関連キーワードを自然に盛り込む
3. category: カテゴリ提案（例：レディース > トップス > Tシャツ）
4. hashtags: ハッシュタグ5〜10個の配列（#なしで）

出力は以下のJSON形式のみにしてください。説明は不要です。
{"title":"...","description":"...","category":"...","hashtags":["...","..."]}`,
              },
            ],
          },
        ],
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API エラー: ${res.status}`)
  }

  const data = await res.json()
  const text =
    data.content?.[0]?.type === 'text'
      ? data.content[0].text
      : ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('応答の解析に失敗しました')
  const parsed = JSON.parse(jsonMatch[0])
  const title = String(parsed.title ?? '').slice(0, 40)
  const description = String(parsed.description ?? '').slice(0, 1000)
  return {
    title,
    description,
    category: parsed.category ?? '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
  }
}

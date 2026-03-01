# 売れる柴ガイド - Supabase 別プロジェクト セットアップ

このアプリは**専用のSupabaseプロジェクト**で運用します。以下に従ってセットアップしてください。

---

## 1. 新規Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com/) にログイン
2. **New Project** をクリック
3. 以下を設定:
   - **Name**: `ureru-shiba-guide`（任意の名前でOK）
   - **Database Password**: 強力なパスワードを設定（保存しておく）
   - **Region**: 日本利用なら `Northeast Asia (Tokyo)` を推奨
4. **Create new project** をクリック（数分かかります）

---

## 2. APIキーを取得

1. 作成したプロジェクトのダッシュボードを開く
2. 左メニュー **Project Settings**（歯車アイコン）→ **API**
3. 以下をコピー:
   - **Project URL**
   - **anon public**（公開鍵。`Project API keys` の下にあります）

---

## 3. 環境変数を設定

1. プロジェクト直下に `.env` を作成（`.env.example` をコピーして編集）

```bash
cp .env.example .env
```

2. `.env` を開き、取得した値を入力:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

---

## 4. マイグレーションを実行

1. Supabaseダッシュボード左メニュー **SQL Editor** を開く
2. **New query** をクリック
3. `supabase/migrations/001_initial.sql` の内容をすべてコピー
4. SQL Editor に貼り付けて **Run** を実行

これで `user_settings`、`edit_presets`、`saved_listings` テーブルとRLSが作成されます。

---

## 5. 動作確認

1. 開発サーバーを起動: `npm run dev`
2. アプリを開き、設定から **新規登録** または **ログイン**
3. ログイン後、APIキーを保存・プリセットを保存・出品を保存すると Supabase に同期されます

---

## トラブルシューティング

- **「Invalid API key」**: `.env` の `VITE_SUPABASE_ANON_KEY` が正しいか確認
- **「relation does not exist」**: マイグレーション（4の手順）が未実行の可能性
- 本番（Vercel）では **Project Settings > Environment Variables** に同じ `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してください

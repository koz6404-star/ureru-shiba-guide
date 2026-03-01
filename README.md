# メルカリ出品サポートツール

メルカリ出品者向けの画像編集・商品説明文生成Webアプリです。

## 技術スタック

- **フレームワーク**: React + TypeScript
- **スタイリング**: Tailwind CSS
- **画像処理**: Canvas API + @imgly/background-removal
- **AI**: Anthropic Claude API（claude-sonnet-4-6）
- **ビルドツール**: Vite
- **ホスティング**: Vercel（無料枠）

## 機能

1. **STEP 1 - 画像アップロード**: ドラッグ＆ドロップ、複数画像対応、1枚目がトップ画像
2. **STEP 2 - 編集設定**: 背景設定（トップ画像）、明るさ・コントラスト・彩度、リサイズオプション
3. **STEP 3 - 一括処理**: 背景除去、編集適用、メルカリ推奨サイズ（1200×1200px）へ変換
4. **STEP 4 - 説明文生成**: Claude APIで商品タイトル・説明文・カテゴリ・ハッシュタグを自動生成
5. **STEP 5 - ダウンロード**: 全画像をZIPで一括ダウンロード

## セットアップ

```bash
npm install
npm run dev
```

## ドキュメント

- **[利用マニュアル](docs/USER_MANUAL.md)** … 利用者向け（APIキーの取得・料金・会員登録など）
- **[Supabase セットアップ](docs/SUPABASE_SETUP.md)** … 開発者向け（デプロイ時のDB設定）

## 環境

- Anthropic APIキーは画面上の設定（⚙️）から入力
- ログイン時はSupabaseに保存、未ログイン時はlocalStorageに保存

## ビルド

```bash
npm run build
```

## Vercel デプロイ

```bash
vercel
```

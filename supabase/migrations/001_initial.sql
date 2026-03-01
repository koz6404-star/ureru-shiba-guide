-- 売れる柴ガイド: 初期スキーマ
-- Supabaseダッシュボードの SQL Editor で実行してください

-- 1. ユーザー設定（APIキーなど）
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. 編集プリセット
CREATE TABLE IF NOT EXISTS edit_presets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  selected_background TEXT NOT NULL,
  custom_color TEXT,
  custom_image_data_url TEXT,
  adjustments JSONB NOT NULL DEFAULT '{"brightness":0,"contrast":0,"saturation":0}',
  maintain_aspect_ratio BOOLEAN DEFAULT false,
  created_at BIGINT NOT NULL
);

-- 3. 保存済み出品
CREATE TABLE IF NOT EXISTS saved_listings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  category TEXT,
  hashtags JSONB DEFAULT '[]',
  image_urls JSONB DEFAULT '[]',
  created_at BIGINT NOT NULL
);

-- 4. RLS（Row Level Security）有効化
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

-- 5. ポリシー: 自分のデータのみアクセス可
DROP POLICY IF EXISTS "user_settings_policy" ON user_settings;
CREATE POLICY "user_settings_policy" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "edit_presets_policy" ON edit_presets;
CREATE POLICY "edit_presets_policy" ON edit_presets
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_listings_policy" ON saved_listings;
CREATE POLICY "saved_listings_policy" ON saved_listings
  FOR ALL USING (auth.uid() = user_id);

-- 6. Storage: Supabaseダッシュボードで「Storage」→「New bucket」→
--    名前「listing-images」、Public で作成してください。
--    RLSポリシーは必要に応じて追加（認証ユーザーのみアップロード可）

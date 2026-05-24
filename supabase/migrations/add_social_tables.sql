-- =============================================
-- MILESTONE 4: SOCIAL FEATURES TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Prompt Likes Table
CREATE TABLE IF NOT EXISTS prompt_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

-- 2. Prompt Comments Table
CREATE TABLE IF NOT EXISTS prompt_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES prompt_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Follows Table
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- 4. Prompt Saves Table
CREATE TABLE IF NOT EXISTS prompt_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'follow', 'save')),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES prompt_comments(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Prompt Likes indexes
CREATE INDEX IF NOT EXISTS idx_prompt_likes_user_id ON prompt_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_prompt_id ON prompt_likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_created_at ON prompt_likes(created_at);

-- Prompt Comments indexes
CREATE INDEX IF NOT EXISTS idx_prompt_comments_prompt_id ON prompt_comments(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_comments_user_id ON prompt_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_comments_parent_id ON prompt_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_prompt_comments_created_at ON prompt_comments(created_at);

-- User Follows indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);

-- Prompt Saves indexes
CREATE INDEX IF NOT EXISTS idx_prompt_saves_user_id ON prompt_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_saves_prompt_id ON prompt_saves(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_saves_created_at ON prompt_saves(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- =============================================
-- UPDATE PROMPTS TABLE WITH SOCIAL STATS
-- =============================================

-- Ensure prompts table has social stats columns (they should exist from Milestone 3)
-- But just in case, add them if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'like_count') THEN
        ALTER TABLE prompts ADD COLUMN like_count INT NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'save_count') THEN
        ALTER TABLE prompts ADD COLUMN save_count INT NOT NULL DEFAULT 0;
    END IF;
END $$;

-- =============================================
-- UPDATE PROFILES TABLE WITH FOLLOW STATS
-- =============================================

-- Add follower/following counts to profiles (for caching)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
        ALTER TABLE profiles ADD COLUMN followers_count INT NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
        ALTER TABLE profiles ADD COLUMN following_count INT NOT NULL DEFAULT 0;
    END IF;
END $$;

-- =============================================
-- TRIGGERS FOR UPDATING COUNTS
-- =============================================

-- Update prompt like count trigger
CREATE OR REPLACE FUNCTION update_prompt_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE prompts SET like_count = like_count + 1 WHERE id = NEW.prompt_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE prompts SET like_count = like_count - 1 WHERE id = OLD.prompt_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_prompt_like_count ON prompt_likes;
CREATE TRIGGER trigger_update_prompt_like_count
    AFTER INSERT OR DELETE ON prompt_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_prompt_like_count();

-- Update prompt save count trigger
CREATE OR REPLACE FUNCTION update_prompt_save_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE prompts SET save_count = save_count + 1 WHERE id = NEW.prompt_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE prompts SET save_count = save_count - 1 WHERE id = OLD.prompt_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_prompt_save_count ON prompt_saves;
CREATE TRIGGER trigger_update_prompt_save_count
    AFTER INSERT OR DELETE ON prompt_saves
    FOR EACH ROW
    EXECUTE FUNCTION update_prompt_save_count();

-- Update user followers count triggers
CREATE OR REPLACE FUNCTION update_user_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
        UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_followers_count ON user_follows;
CREATE TRIGGER trigger_update_user_followers_count
    AFTER INSERT OR DELETE ON user_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_user_followers_count();

-- Update comment like count trigger
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE prompt_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE prompt_comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Note: You'll need a comment_likes table if you want comment likes
-- For now, we'll skip comment likes in Milestone 4

-- Update updated_at for comments
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON prompt_comments;
CREATE TRIGGER trigger_update_comments_updated_at
    BEFORE UPDATE ON prompt_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_updated_at();
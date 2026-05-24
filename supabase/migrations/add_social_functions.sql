-- =============================================
-- HELPER FUNCTIONS FOR SOCIAL FEATURES
-- Run this in Supabase SQL Editor
-- =============================================

-- Function to get feed for a user
CREATE OR REPLACE FUNCTION get_user_feed(
    p_user_id UUID,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    type TEXT,
    prompt_id UUID,
    user_id UUID,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        'prompt'::TEXT as type,
        p.id as prompt_id,
        p.user_id,
        p.created_at
    FROM prompts p
    WHERE p.user_id IN (
        SELECT following_id 
        FROM user_follows 
        WHERE follower_id = p_user_id
    )
    AND p.is_draft = FALSE
    AND p.visibility = 'public'
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending prompts
CREATE OR REPLACE FUNCTION get_trending_prompts(
    p_limit INT DEFAULT 10,
    p_days INT DEFAULT 7
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    view_count INT,
    like_count INT,
    save_count INT,
    score FLOAT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.view_count,
        p.like_count,
        p.save_count,
        (p.view_count * 0.3 + p.like_count * 0.5 + p.save_count * 0.2)::FLOAT as score,
        p.created_at
    FROM prompts p
    WHERE p.is_draft = FALSE
    AND p.visibility = 'public'
    AND p.created_at > NOW() - (p_days || ' days')::INTERVAL
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get mutual follows
CREATE OR REPLACE FUNCTION get_mutual_follows(
    p_user_id UUID
)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.avatar_url
    FROM profiles p
    WHERE p.id IN (
        SELECT f1.following_id
        FROM user_follows f1
        WHERE f1.follower_id = p_user_id
        AND f1.following_id IN (
            SELECT f2.follower_id
            FROM user_follows f2
            WHERE f2.following_id = p_user_id
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has liked a prompt
CREATE OR REPLACE FUNCTION has_user_liked_prompt(
    p_user_id UUID,
    p_prompt_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM prompt_likes
        WHERE user_id = p_user_id AND prompt_id = p_prompt_id
    ) INTO v_exists;
    RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has saved a prompt
CREATE OR REPLACE FUNCTION has_user_saved_prompt(
    p_user_id UUID,
    p_prompt_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM prompt_saves
        WHERE user_id = p_user_id AND prompt_id = p_prompt_id
    ) INTO v_exists;
    RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user follows another user
CREATE OR REPLACE FUNCTION does_user_follow(
    p_follower_id UUID,
    p_following_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM user_follows
        WHERE follower_id = p_follower_id AND following_id = p_following_id
    ) INTO v_exists;
    RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
    p_user_id UUID
)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM notifications
    WHERE user_id = p_user_id AND read = FALSE;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INT AS $$
DECLARE
    v_deleted INT;
BEGIN
    WITH deleted AS (
        DELETE FROM notifications
        WHERE created_at < NOW() - INTERVAL '30 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted FROM deleted;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily (requires pg_cron extension)
-- If pg_cron is not available, run manually or use a cron job

-- Function to get user's saved prompts with pagination
CREATE OR REPLACE FUNCTION get_user_saved_prompts(
    p_user_id UUID,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE(
    save_id UUID,
    prompt_id UUID,
    title TEXT,
    prompt_text TEXT,
    saved_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.id as save_id,
        ps.prompt_id,
        p.title,
        p.prompt_text,
        ps.created_at as saved_at
    FROM prompt_saves ps
    JOIN prompts p ON ps.prompt_id = p.id
    WHERE ps.user_id = p_user_id
    ORDER BY ps.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get comment count for a prompt
CREATE OR REPLACE FUNCTION get_prompt_comment_count(
    p_prompt_id UUID
)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM prompt_comments
    WHERE prompt_id = p_prompt_id;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get reply count for a comment
CREATE OR REPLACE FUNCTION get_comment_reply_count(
    p_comment_id UUID
)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM prompt_comments
    WHERE parent_id = p_comment_id;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
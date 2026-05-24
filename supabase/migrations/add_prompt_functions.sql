-- Function to increment prompt view count
CREATE OR REPLACE FUNCTION increment_prompt_views(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prompts
  SET view_count = view_count + 1
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment prompt like count
CREATE OR REPLACE FUNCTION increment_prompt_likes(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prompts
  SET like_count = like_count + 1
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement prompt like count
CREATE OR REPLACE FUNCTION decrement_prompt_likes(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prompts
  SET like_count = like_count - 1
  WHERE id = prompt_id AND like_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to increment prompt save count
CREATE OR REPLACE FUNCTION increment_prompt_saves(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prompts
  SET save_count = save_count + 1
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement prompt save count
CREATE OR REPLACE FUNCTION decrement_prompt_saves(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prompts
  SET save_count = save_count - 1
  WHERE id = prompt_id AND save_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to increment tag usage
CREATE OR REPLACE FUNCTION increment_tag_usage(tag_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tags
  SET usage_count = usage_count + 1
  WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement tag usage
CREATE OR REPLACE FUNCTION decrement_tag_usage(tag_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tags
  SET usage_count = usage_count - 1
  WHERE id = tag_id AND usage_count > 0;
END;
$$ LANGUAGE plpgsql;
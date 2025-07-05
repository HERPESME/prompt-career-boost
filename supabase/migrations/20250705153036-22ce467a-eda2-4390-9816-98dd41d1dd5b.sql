-- Fix the foreign key constraint issue in user_tokens table
-- Remove the foreign key constraint to auth.users (Supabase managed table)
ALTER TABLE public.user_tokens DROP CONSTRAINT IF EXISTS user_tokens_user_id_fkey;

-- The user_id column should still exist but without the foreign key constraint
-- This follows Supabase best practices for referencing auth.users
-- RLS policies will ensure data security instead of foreign key constraints
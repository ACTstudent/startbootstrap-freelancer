-- Supabase Database Schema Setup Script (Updated - No Roles)
-- Paste this script into the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query) and run it.

-- 1. Create a public profiles table that links to Supabase's private Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    birthday DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on profiles table (recommended)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow users to read all profiles
CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT USING (true);

-- Allow users to insert and update only their own profile
CREATE POLICY "Allow individual write access to profiles" 
    ON public.profiles FOR ALL USING (auth.uid() = id);

-- 4. Trigger: Automatically insert a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, birthday)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        CASE 
            WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL 
            THEN (new.raw_user_meta_data->>'birthday')::DATE
            ELSE NULL
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

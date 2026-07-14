-- Supabase Database Schema Setup Script
-- Paste this script into the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query) and run it.

-- 1. Create the Role table
CREATE TABLE IF NOT EXISTS public."Role" (
    role_id INT PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Populate standard roles
INSERT INTO public."Role" (role_id, role) VALUES 
(1, 'Admin'),
(2, 'Teacher'),
(3, 'Student')
ON CONFLICT (role_id) DO NOTHING;

-- 3. Create a public profiles table that links to Supabase's private Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    role_id INT REFERENCES public."Role"(role_id) DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) on public tables (recommended)
ALTER TABLE public."Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Allow anyone to read roles
CREATE POLICY "Allow public read access to roles" 
    ON public."Role" FOR SELECT USING (true);

-- Allow users to read all profiles, but only update their own
CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow individual write access to profiles" 
    ON public.profiles FOR ALL USING (auth.uid() = id);

-- 6. Trigger: Automatically insert a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, role_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        3 -- Default role: Student
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

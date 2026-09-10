-- ==========================================================
-- ☁️ CLOUD FILE SHARING SYSTEM (SUPABASE SQL SCHEMA)
-- ==========================================================
-- Run this in your Supabase Project -> SQL Editor -> New Query

-- 1. Create the files metadata table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type TEXT,
    is_public BOOLEAN DEFAULT false,
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for files table

-- Policy: Users can see only their own files
CREATE POLICY "Users can view own files" 
ON public.files FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Anyone can view file metadata if it has a public share token
CREATE POLICY "Public files are viewable by share token" 
ON public.files FOR SELECT 
USING (is_public = true);

-- Policy: Users can insert their own file records
CREATE POLICY "Users can insert own files" 
ON public.files FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own files (toggle public share, rename, etc.)
CREATE POLICY "Users can update own files" 
ON public.files FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files" 
ON public.files FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create Storage Bucket for user uploads
-- Note: You can also create this bucket in Supabase Dashboard -> Storage -> New Bucket ("cloud_files")
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cloud_files', 'cloud_files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies for "cloud_files" bucket

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cloud_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view/download their own files
CREATE POLICY "Users can view own files in storage"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cloud_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to view/download files in storage if they are stored in the bucket
CREATE POLICY "Anyone can download public storage files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cloud_files');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files in storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cloud_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files in storage"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cloud_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Helper function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(file_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.files
    SET download_count = download_count + 1
    WHERE id = file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

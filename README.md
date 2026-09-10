# CloudVault — Cloud File Sharing System

CloudVault is a lightweight, modern cloud file storage and sharing platform inspired by services such as Google Drive and Dropbox.

It is built with React (Vite), Tailwind CSS, and Supabase for authentication, PostgreSQL database management, and object storage.

The project is designed to work entirely within free-tier infrastructure.

## Features

* User authentication with email and password using Supabase Auth
* Drag-and-drop file uploads
* File browser upload support
* Multiple file upload queue
* Upload progress indicators
* Automatic image previews
* File categorization for documents, PDFs, audio, video, archives, code, and other file types
* Storage usage meter with configurable quota limits
* Public shareable links
* One-click copy-to-clipboard for shared links
* Standalone public download page using `?share=TOKEN`
* PostgreSQL Row Level Security (RLS)
* Private file access restricted to the file owner
* Direct file downloads from Supabase Storage
* Download count tracking
* Real-time file search
* Sorting by file name, category, size, and upload date
* Grid and list display modes

## Technology Stack

* React
* Vite
* Tailwind CSS
* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage
* PostgreSQL Row Level Security
* Vercel for optional deployment

## Setup Guide

### 1. Create a Supabase Project

1. Open the Supabase website and create a free account or sign in.
2. Create a new project.
3. Choose an organization, project name, database password, and region.
4. Wait for Supabase to finish provisioning the project.

### 2. Configure the Database and Storage

Open your Supabase project and navigate to:

`SQL Editor`

Create a new SQL query and execute the contents of:

`supabase/schema.sql`

The schema should contain the following:

```sql
-- 1. Create files metadata table
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

-- 2. Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own files"
ON public.files
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Public files are viewable by share token"
ON public.files
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can insert own files"
ON public.files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
ON public.files
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
ON public.files
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cloud_files', 'cloud_files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies
CREATE POLICY "Users can upload files to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'cloud_files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own files in storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'cloud_files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can download public storage files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cloud_files');

CREATE POLICY "Users can update own files in storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'cloud_files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files in storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'cloud_files'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Increment download count function
CREATE OR REPLACE FUNCTION increment_download_count(file_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.files
    SET download_count = download_count + 1
    WHERE id = file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

After pasting the SQL into the editor, click `Run` or press `Ctrl + Enter`.

A successful execution should display:

`Success. No rows returned`

### 3. Configure Authentication

Supabase enables email confirmation by default.

If you want users to sign in immediately after registration:

1. Open your Supabase project.
2. Navigate to `Authentication`.
3. Open `Providers`.
4. Select `Email`.
5. Disable `Confirm email`.
6. Save the changes.

This setting is optional. You can leave email confirmation enabled for a more traditional account verification flow.

### 4. Configure Environment Variables

Open your Supabase project.

Navigate to:

`Project Settings > API`

Locate the following values:

* Project URL
* Anon / Public API Key

Create a `.env` file in the root directory of the project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace the example values with the credentials from your Supabase project.

Do not commit your `.env` file to a public repository.

### 5. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### 6. Start the Development Server

Run:

```bash
npm run dev
```

Vite will start the local development server.

Open the address displayed in your terminal, typically:

```text
http://localhost:5173
```

## Project Structure

A typical project structure can look like this:

```text
cloudvault/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── hooks/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── schema.sql
├── public/
├── .env
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## File Storage

Files are stored in the Supabase Storage bucket:

```text
cloud_files
```

Each user's files should be stored inside a folder corresponding to their Supabase user ID.

Example:

```text
cloud_files/
└── USER_ID/
    ├── document.pdf
    ├── photo.jpg
    └── presentation.pptx
```

The storage policies ensure that authenticated users can only modify files belonging to their own user folder.

## Public File Sharing

When a user enables sharing for a file, CloudVault generates a unique share token.

A public link can use the following structure:

```text
https://your-domain.com/?share=SHARE_TOKEN
```

The application reads the token from the URL and loads the corresponding public file.

The public download page can display:

* File name
* File type
* File size
* Download button
* Download count

Private files remain inaccessible through the public sharing interface.

## Storage Usage

CloudVault can calculate storage usage from the user's uploaded files.

The application can display:

```text
Used Storage
2.4 GB / 5 GB
```

The storage meter can be used to prevent uploads once the configured user quota has been reached.

The quota itself can be adjusted according to the requirements of the application.

## Search and Sorting

The file browser supports searching and sorting by:

* File name
* File category
* File size
* Upload date

Files can be displayed using either:

* Grid view
* List view

Search results should update as the user enters text without requiring a page reload.

## Deployment

CloudVault can be deployed to Vercel using the free tier.

### 1. Push the Project to GitHub

Create a Git repository and push the project:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

### 2. Import the Repository into Vercel

Open Vercel and import the GitHub repository.

Vercel will automatically detect the Vite configuration.

### 3. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Use the same values configured in your local `.env` file.

### 4. Deploy

Click `Deploy`.

Once deployment is complete, Vercel will provide the production URL for your CloudVault application.

## Security

CloudVault uses Supabase Row Level Security to restrict access to private file metadata.

The application should never expose the Supabase service-role key in frontend code.

Only the public anonymous key should be used by the Vite frontend.

The service-role key must remain server-side and must never be included in:

* `.env` variables prefixed with `VITE_`
* React components
* Browser JavaScript
* Public Git repositories

## License

Copyright (c) 2026 Tanmay Goel

All rights reserved.

This software and its source code are proprietary and confidential.

No permission is granted to any person or organization to copy, modify, distribute, publish, sublicense, sell, rent, lease, or create derivative works from this software, in whole or in part, without prior written permission from the copyright holder.

Unauthorized use, reproduction, distribution, or modification of this software is prohibited.

The copyright holder retains all rights, title, and interest in the software and its source code.

For licensing inquiries or permission to use this software, contact the copyright holder directly.

Add your preferred license here before publishing the project.

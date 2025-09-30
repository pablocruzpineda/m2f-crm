-- Storage bucket configuration for workspace logos
-- This should be run in Supabase SQL Editor or via migration

-- Create storage bucket for workspace logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-logos',
  'workspace-logos',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

-- Storage policies for workspace logos

-- Allow authenticated users to upload logos to their workspace folder
CREATE POLICY "Users can upload workspace logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workspace-logos' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Allow everyone to view logos (public read)
CREATE POLICY "Anyone can view workspace logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workspace-logos');

-- Allow users to update their workspace logos
CREATE POLICY "Users can update workspace logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'workspace-logos' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete their workspace logos
CREATE POLICY "Users can delete workspace logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'workspace-logos' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  )
);

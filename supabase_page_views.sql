CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  path text NOT NULL,
  title text,
  duration_seconds integer DEFAULT 0,
  ip_address text,
  country text,
  device_type text,
  operating_system text,
  browser text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication errors on retry
DROP POLICY IF EXISTS "Allow public insert to page_views" ON public.page_views;
CREATE POLICY "Allow public insert to page_views" ON public.page_views
  FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to own session page_views" ON public.page_views;
CREATE POLICY "Allow public update to own session page_views" ON public.page_views
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin read page_views" ON public.page_views;
CREATE POLICY "Allow admin read page_views" ON public.page_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Function to automatically update `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any to avoid duplication errors
DROP TRIGGER IF EXISTS update_page_views_updated_at ON public.page_views;
CREATE TRIGGER update_page_views_updated_at
BEFORE UPDATE ON public.page_views
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);

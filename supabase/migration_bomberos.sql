-- ============================================================================
-- Bombero accounts (RESPOND Triage app) — completely separate from the
-- hospital auth.users/profiles system. Identified by Google's stable
-- subject id (sub), verified server-side with google-auth-library.
-- No RLS policies grant bomberos any access to `patients` — all writes to
-- `patients` still go exclusively through the service-role-only
-- /api/external/triage-intake route.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bombero_profiles (
  id TEXT PRIMARY KEY,              -- Google "sub" claim, stable per Google account
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bombero_training_progress (
  bombero_id TEXT NOT NULL REFERENCES public.bombero_profiles(id) ON DELETE CASCADE,
  module_letter TEXT NOT NULL,
  best_score INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (bombero_id, module_letter)
);

CREATE TABLE IF NOT EXISTS public.alert_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN NOT NULL,
  bombero_id TEXT,
  error_message TEXT
);

-- RLS enabled with NO policies -> only the service role (which bypasses RLS)
-- can read/write these tables. Never reachable from a browser with the anon
-- key, and never overlaps with the hospital `patients`/`profiles` RLS above.
ALTER TABLE public.bombero_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bombero_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS bombero_id TEXT;

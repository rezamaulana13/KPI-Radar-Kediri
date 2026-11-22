-- ==============================================================================
-- SISTEM INFORMASI MONITORING KINERJA PEMASARAN & SIRKULASI (SIMOKP)
-- JAWA POS RADAR KEDIRI (PT KEDIRI INTERMEDIA PERS)
-- SKRIP MIGRASI & PENYEMPURNAAN TABEL SUPABASE (IDEMPOTENT & AMAN DATA LAMA)
-- ==============================================================================

-- 1. Tambahkan kolom baru pada marketing_activities (Sirkulasi Oplah & Transaksi Iklan)
ALTER TABLE public.marketing_activities 
  ADD COLUMN IF NOT EXISTS return_qty integer,
  ADD COLUMN IF NOT EXISTS sold_qty integer,
  ADD COLUMN IF NOT EXISTS return_condition text,
  ADD COLUMN IF NOT EXISTS edition_name text,
  ADD COLUMN IF NOT EXISTS partnership_type text,
  ADD COLUMN IF NOT EXISTS barter_type text,
  ADD COLUMN IF NOT EXISTS cash_value numeric default 0,
  ADD COLUMN IF NOT EXISTS barter_value numeric default 0,
  ADD COLUMN IF NOT EXISTS barter_desc text,
  ADD COLUMN IF NOT EXISTS realization_status text,
  ADD COLUMN IF NOT EXISTS proof_url text;

-- 2. Pastikan tabel clients ada dan lengkap
CREATE TABLE IF NOT EXISTS public.clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  sector text,
  contact text,
  phone text,
  city text,
  owner_id uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now()
);

-- 3. Pastikan tabel offers ada dan lengkap
CREATE TABLE IF NOT EXISTS public.offers (
  id text PRIMARY KEY,
  client_id text REFERENCES public.clients(id),
  program_name text NOT NULL,
  owner_id uuid REFERENCES public.users(id),
  offer_date date NOT NULL,
  value numeric DEFAULT 0,
  period_id text REFERENCES public.assessment_periods(id),
  note text,
  created_at timestamptz DEFAULT now()
);

-- 4. Pastikan tabel activity_verifications ada dan lengkap
CREATE TABLE IF NOT EXISTS public.activity_verifications (
  id bigserial PRIMARY KEY,
  activity_id text NOT NULL REFERENCES public.marketing_activities(id) ON DELETE CASCADE,
  status text NOT NULL,
  verified_by uuid NOT NULL REFERENCES public.users(id),
  note text,
  created_at timestamptz DEFAULT now()
);

-- 5. Pastikan tabel audit_logs ada dan lengkap
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES public.users(id),
  action text NOT NULL,
  detail text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. Buat Indeks Performa untuk Pencarian dan Filter Cepat
CREATE INDEX IF NOT EXISTS idx_activities_owner_period ON public.marketing_activities(owner_id, period_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.marketing_activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.marketing_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_verifications_activity ON public.activity_verifications(activity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);

-- 7. Refresh PostgREST Schema Cache (Penting agar API Supabase langsung mengenali kolom baru)
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- RESPOND Guatemala Trauma Registry - Supabase Migration
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  institution TEXT,
  role TEXT DEFAULT 'registrar' CHECK (role IN ('registrar', 'admin', 'viewer')),
  language TEXT DEFAULT 'es' CHECK (language IN ('es', 'en')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, institution, role, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'institution', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'registrar'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'es')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Patients table (all 116 fields as columns)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT UNIQUE NOT NULL,

  -- Step 1: Hospital Identification
  hospital_id TEXT,
  hospital_other TEXT,
  registry_number TEXT,
  admission_date DATE,
  admission_time TEXT,

  -- Step 2: Patient Demographics
  patient_age INTEGER,
  patient_age_unit TEXT,
  patient_sex TEXT,
  patient_ethnicity TEXT,
  patient_municipality TEXT,
  patient_department TEXT,
  patient_referral_source TEXT,

  -- Step 3: Injury Event
  injury_date DATE,
  injury_time TEXT,
  injury_setting TEXT,
  injury_location_type TEXT,
  injury_intent TEXT,
  injury_mechanism TEXT,
  injury_activity TEXT,
  injury_lat DOUBLE PRECISION,  -- geospatial: latitude of injury location
  injury_lng DOUBLE PRECISION,  -- geospatial: longitude of injury location

  -- Step 4: Road Traffic Details
  rtc_role TEXT,
  rtc_vehicle_type TEXT,
  rtc_counterpart TEXT,
  rtc_helmet BOOLEAN,
  rtc_seatbelt BOOLEAN,
  rtc_alcohol_suspected BOOLEAN,

  -- Step 5: Violence Details
  violence_weapon TEXT,
  violence_relationship TEXT,
  violence_location TEXT,
  violence_alcohol_victim BOOLEAN,
  violence_alcohol_perpetrator BOOLEAN,
  violence_reported_police BOOLEAN,

  -- Step 6: Pre-Hospital Care
  prehospital_care BOOLEAN,
  prehospital_provider TEXT,
  prehospital_time_minutes INTEGER,
  prehospital_airway BOOLEAN,
  prehospital_iv BOOLEAN,
  prehospital_immobilization BOOLEAN,
  prehospital_cpr BOOLEAN,

  -- Step 7: Arrival Assessment
  arrival_gcs_eye INTEGER,
  arrival_gcs_verbal INTEGER,
  arrival_gcs_motor INTEGER,
  arrival_gcs_total INTEGER,
  arrival_avpu TEXT,
  arrival_systolic_bp INTEGER,
  arrival_diastolic_bp INTEGER,
  arrival_heart_rate INTEGER,
  arrival_respiratory_rate INTEGER,
  arrival_spo2 INTEGER,
  arrival_temperature NUMERIC(4,1),
  arrival_shock_index NUMERIC(4,2),

  -- Step 8: Pupil Assessment
  pupil_right_size TEXT,
  pupil_right_reactive BOOLEAN,
  pupil_left_size TEXT,
  pupil_left_reactive BOOLEAN,
  pupil_equal BOOLEAN,

  -- Step 9: Body Region Injuries
  body_regions_affected JSONB DEFAULT '[]',
  injuries JSONB DEFAULT '[]',
  number_of_injuries INTEGER,

  -- Step 10: AIS/ISS Scoring
  ais_head_neck INTEGER,
  ais_face INTEGER,
  ais_chest INTEGER,
  ais_abdomen INTEGER,
  ais_extremities INTEGER,
  ais_external INTEGER,
  iss_score INTEGER,
  iss_category TEXT,

  -- Step 11: Diagnostics
  diagnostics_xray BOOLEAN,
  diagnostics_ct BOOLEAN,
  diagnostics_ultrasound BOOLEAN,
  diagnostics_fast BOOLEAN,
  diagnostics_labs BOOLEAN,
  diagnostics_other TEXT,

  -- Step 12: Procedures / Treatment
  procedure_airway BOOLEAN,
  procedure_chest_tube BOOLEAN,
  procedure_central_line BOOLEAN,
  procedure_blood_transfusion BOOLEAN,
  procedure_splinting BOOLEAN,
  procedure_wound_care BOOLEAN,
  procedure_surgery BOOLEAN,
  procedure_surgery_type TEXT,
  procedure_other TEXT,

  -- Step 13: Disposition
  disposition TEXT,
  disposition_department TEXT,
  disposition_transfer_to TEXT,
  disposition_date DATE,
  disposition_time TEXT,

  -- Step 14: Surgery Details
  surgery_date DATE,
  surgery_time TEXT,
  surgery_type TEXT,
  surgery_findings TEXT,
  surgery_complications BOOLEAN,
  surgery_complication_details TEXT,

  -- Step 15: Outcome
  outcome TEXT,
  outcome_date DATE,
  death_date DATE,
  death_time TEXT,
  death_cause TEXT,
  los_days INTEGER,
  icu_days INTEGER,
  ventilator_days INTEGER,

  -- Step 16: Quality Indicators
  quality_time_to_surgery_minutes INTEGER,
  quality_time_to_ct_minutes INTEGER,
  quality_documentation_score INTEGER,
  quality_notes TEXT,

  -- Step 17: Record Info
  record_status TEXT DEFAULT 'draft',
  sync_status TEXT DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_patients_hospital ON public.patients(hospital_id);
CREATE INDEX idx_patients_admission_date ON public.patients(admission_date);
CREATE INDEX idx_patients_created_by ON public.patients(created_by);
CREATE INDEX idx_patients_sync_status ON public.patients(sync_status);
CREATE INDEX idx_patients_local_id ON public.patients(local_id);

-- Sync log table
CREATE TABLE IF NOT EXISTS public.sync_log (
  id BIGSERIAL PRIMARY KEY,
  patient_local_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Patients: users see their institution's patients
CREATE POLICY "Users can view institution patients"
  ON public.patients FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid()
      AND p2.id = public.patients.created_by
      AND p1.institution = p2.institution
    )
  );

CREATE POLICY "Users can insert patients"
  ON public.patients FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own patients"
  ON public.patients FOR UPDATE
  USING (created_by = auth.uid());

-- Admins can manage all patients in their institution
CREATE POLICY "Admins can update institution patients"
  ON public.patients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sync log: users can insert and view their own
CREATE POLICY "Users can insert sync log"
  ON public.sync_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own sync log"
  ON public.sync_log FOR SELECT
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- Weekly report configuration
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_configs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id text,
  recipient_emails text[] NOT NULL DEFAULT '{}',
  enabled     boolean NOT NULL DEFAULT false,
  send_day    smallint NOT NULL DEFAULT 1,   -- 1=Monday … 7=Sunday
  send_hour   smallint NOT NULL DEFAULT 7,   -- UTC hour
  last_sent_at timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE report_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can manage report_configs"
  ON report_configs FOR ALL USING (auth.role() = 'authenticated');

-- Add report_sections column (run this if the table was already created)
ALTER TABLE report_configs
  ADD COLUMN IF NOT EXISTS report_sections text[]
    DEFAULT ARRAY['summary','mortality','avgs','mechanisms','iss','completeness']::text[];

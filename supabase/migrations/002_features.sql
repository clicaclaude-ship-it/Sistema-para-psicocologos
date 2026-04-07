-- 1. Update patient status constraint
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_status_check;
ALTER TABLE patients ADD CONSTRAINT patients_status_check
  CHECK (status IN ('acompanhamento', 'avaliacao', 'alta'));
ALTER TABLE patients ALTER COLUMN status SET DEFAULT 'acompanhamento';
-- Migrar dados existentes
UPDATE patients SET status = 'acompanhamento' WHERE status = 'active';
UPDATE patients SET status = 'alta' WHERE status IN ('inactive', 'archived');

-- 2. Recurrence in appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'none'
  CHECK (recurrence IN ('none', 'weekly', 'biweekly', 'monthly'));
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

-- 3. WhatsApp config in psychologists
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_provider TEXT DEFAULT 'evolution';
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_api_url TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_instance TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_token TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_reminder_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_reminder_message TEXT DEFAULT 'Olá {{nome}}, lembrando da sua consulta amanhã às {{horario}}. Até lá! 😊';
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_birthday_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS whatsapp_birthday_message TEXT DEFAULT 'Olá {{nome}}, hoje é um dia muito especial! Desejo a você um feliz aniversário cheio de saúde, alegria e realizações! 🎂🎉';

-- 4. Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Contrato Terapêutico',
  content TEXT NOT NULL,
  signature_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  signed_at TIMESTAMPTZ,
  signed_name TEXT,
  signed_cpf TEXT,
  signed_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "contracts_own" ON contracts FOR ALL USING (psychologist_id = auth.uid());
-- Permitir leitura pública para assinatura (via token único)
CREATE POLICY IF NOT EXISTS "contracts_public_sign" ON contracts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "contracts_public_update" ON contracts FOR UPDATE USING (signed_at IS NULL);

-- 5. Laudos table
CREATE TABLE IF NOT EXISTS laudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  avaliacao_tipo TEXT DEFAULT 'neuropsicologica',
  data_inicio DATE,
  data_fim DATE,
  objetivo TEXT,
  historico_queixa TEXT,
  historico_desenvolvimento TEXT,
  historico_escolar TEXT,
  historico_familiar TEXT,
  historico_medico TEXT,
  comportamento_observado TEXT,
  testes_aplicados TEXT,
  resultados TEXT,
  hipotese_diagnostica TEXT,
  conclusao TEXT,
  recomendacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE laudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "laudos_own" ON laudos FOR ALL USING (psychologist_id = auth.uid());

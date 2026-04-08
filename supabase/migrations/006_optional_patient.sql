-- Torna patient_id opcional nos agendamentos (para consultas iniciais / não-pacientes)
ALTER TABLE appointments ALTER COLUMN patient_id DROP NOT NULL;

-- Campo livre para identificar o visitante quando não há paciente cadastrado
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS visitor_name TEXT;

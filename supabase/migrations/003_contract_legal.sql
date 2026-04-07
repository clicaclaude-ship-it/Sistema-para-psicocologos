-- Adiciona colunas para validade jurídica das assinaturas digitais
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_user_agent TEXT;

-- Permitir update público para assinar (necessário para a API route capturar IP server-side)
-- A policy existente já cobre isso, mas garantimos que as novas colunas sejam atualizáveis
-- (Nenhuma policy adicional necessária — a contracts_public_update já permite UPDATE quando signed_at IS NULL)

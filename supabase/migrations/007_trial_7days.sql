-- Reduz período de trial de 14 para 7 dias

-- Altera o default para novos cadastros
ALTER TABLE psychologists
  ALTER COLUMN trial_ends_at SET DEFAULT (NOW() + INTERVAL '7 days');

-- Atualiza usuários existentes que ainda estão em trial e têm mais de 7 dias restantes
-- (recalcula a partir do created_at com 7 dias)
UPDATE psychologists
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE subscription_status = 'trialing'
  AND trial_ends_at > NOW() + INTERVAL '7 days';

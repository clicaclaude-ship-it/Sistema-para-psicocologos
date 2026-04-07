-- Subscription & plan management for PsicoDoc SaaS

-- Add plan/subscription fields to psychologists
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'trial'
  CHECK (plan IN ('trial', 'active', 'suspended', 'cancelled'));

-- Trial: 14 days free from registration
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ
  DEFAULT (NOW() + INTERVAL '14 days');

-- Set existing users' trial_ends_at based on their created_at
UPDATE psychologists
SET trial_ends_at = created_at + INTERVAL '14 days'
WHERE trial_ends_at IS NULL;

-- Stripe integration
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';
-- subscription_status values: trialing | active | past_due | canceled | unpaid

ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS next_payment_at TIMESTAMPTZ;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Admin flag (set manually in Supabase dashboard for the owner's account)
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Mark existing users as trialing (not new signups which default correctly)
UPDATE psychologists
SET subscription_status = 'trialing', plan = 'trial'
WHERE plan = 'trial' AND subscription_status IS NULL;

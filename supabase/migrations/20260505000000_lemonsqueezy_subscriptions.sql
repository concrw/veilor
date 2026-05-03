-- LemonSqueezy 결제 인프라
-- stripe_customers, stripe_webhook_events 대체

-- 기존 stripe 테이블은 DROP 하지 않고 보존 (데이터 손실 방지)
-- 새 LemonSqueezy 전용 컬럼을 subscriptions 테이블에 추가

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS ls_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS ls_customer_id TEXT;

-- 기존 stripe 컬럼은 nullable 유지 (마이그레이션 완료 후 별도 DROP)
-- ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;
-- ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_customer_id;

CREATE INDEX IF NOT EXISTS idx_subscriptions_ls_subscription_id
  ON public.subscriptions (ls_subscription_id);

-- LemonSqueezy webhook 이벤트 중복 방지 테이블
CREATE TABLE IF NOT EXISTS public.lemonsqueezy_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_name TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lemonsqueezy_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role only"
  ON public.lemonsqueezy_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- payment_history: LemonSqueezy order ID 컬럼 추가
ALTER TABLE public.payment_history
  ADD COLUMN IF NOT EXISTS ls_order_id TEXT;

-- 기존 stripe_payment_intent_id nullable 유지

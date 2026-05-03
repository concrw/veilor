import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const log = (level: "info" | "warn" | "error", msg: string, data?: Record<string, unknown>) =>
  console[level](JSON.stringify({ ts: new Date().toISOString(), level, msg, ...data }));

serve(async (req) => {
  const LEMONSQUEEZY_WEBHOOK_SECRET = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "LemonSqueezy not configured" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const signature = req.headers.get("x-signature");
  const body = await req.text();

  // 서명 검증
  const hmac = createHmac("sha256", LEMONSQUEEZY_WEBHOOK_SECRET);
  hmac.update(body);
  const digest = hmac.digest("hex");

  if (signature !== digest) {
    log("warn", "Webhook signature verification failed");
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const meta = payload.meta as Record<string, unknown> | undefined;
  const eventName = meta?.event_name as string | undefined;
  const eventId = meta?.webhook_id as string | undefined;
  const customData = meta?.custom_data as Record<string, unknown> | undefined;

  log("info", "Received event", { eventName, eventId });

  // 중복 이벤트 방어
  if (eventId) {
    const { data: existing } = await supabase
      .from("lemonsqueezy_webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing) {
      log("info", "Duplicate event, skipping", { eventId });
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    await supabase.from("lemonsqueezy_webhook_events").insert({
      event_id: eventId,
      event_name: eventName,
      processed_at: new Date().toISOString(),
    });
  }

  const data = payload.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;

  try {
    switch (eventName) {
      case "order_created": {
        const userId = customData?.userId as string | undefined;
        const tier = (customData?.tier as string | undefined) ?? "pro";
        const status = attributes?.status as string | undefined;

        if (userId && status === "paid") {
          const firstSubItem = attributes?.first_subscription_item as Record<string, unknown> | undefined;
          const subscriptionId = firstSubItem?.subscription_id as string | undefined;

          await supabase.from("subscriptions").upsert({
            user_id: userId,
            ls_subscription_id: String(subscriptionId ?? data?.id ?? ""),
            ls_customer_id: String(attributes?.customer_id ?? ""),
            status: "active",
            tier,
            current_period_end: attributes?.renews_at as string ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "ls_subscription_id" });

          log("info", "Subscription activated via order", { userId, tier });
        }
        break;
      }

      case "subscription_created": {
        const userId = customData?.userId as string | undefined;
        const tier = (customData?.tier as string | undefined) ?? "pro";

        if (userId) {
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            ls_subscription_id: String(data?.id ?? ""),
            ls_customer_id: String(attributes?.customer_id ?? ""),
            status: attributes?.status as string ?? "active",
            tier,
            current_period_start: attributes?.created_at as string ?? null,
            current_period_end: attributes?.renews_at as string ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "ls_subscription_id" });

          log("info", "Subscription created", { userId, tier });
        }
        break;
      }

      case "subscription_updated": {
        const lsSubId = String(data?.id ?? "");
        const status = attributes?.status as string;

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_end: attributes?.renews_at as string ?? null,
            cancel_at_period_end: attributes?.cancelled as boolean ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq("ls_subscription_id", lsSubId);

        log("info", "Subscription updated", { lsSubId, status });
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        const lsSubId = String(data?.id ?? "");

        const { data: sub } = await supabase
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("ls_subscription_id", lsSubId)
          .select("user_id")
          .single();

        if (sub) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", sub.user_id);
        }

        log("info", "Subscription canceled", { lsSubId });
        break;
      }

      case "subscription_payment_success": {
        const lsSubId = String(data?.id ?? "");
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("ls_subscription_id", lsSubId)
          .maybeSingle();

        if (sub) {
          await supabase.from("payment_history").insert({
            user_id: sub.user_id,
            ls_order_id: String(attributes?.order_id ?? ""),
            amount: Number(attributes?.total ?? 0),
            currency: String(attributes?.currency ?? "usd"),
            status: "succeeded",
          });
        }
        break;
      }

      case "subscription_payment_failed": {
        const lsSubId = String(data?.id ?? "");
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("ls_subscription_id", lsSubId)
          .maybeSingle();

        if (sub) {
          await supabase.from("payment_history").insert({
            user_id: sub.user_id,
            ls_order_id: String(attributes?.order_id ?? ""),
            amount: Number(attributes?.total ?? 0),
            currency: String(attributes?.currency ?? "usd"),
            status: "failed",
          });
        }
        break;
      }

      default:
        log("info", "Unhandled event", { eventName });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    log("error", "Error handling webhook", { error: String(error) });
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});

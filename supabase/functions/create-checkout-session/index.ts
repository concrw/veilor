import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getAuthenticatedUser, createServiceClient } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const LEMONSQUEEZY_API_KEY = Deno.env.get("LEMONSQUEEZY_API_KEY");
    if (!LEMONSQUEEZY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LemonSqueezy not configured" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const { user } = await getAuthenticatedUser(req);
    const supabase = createServiceClient();

    const { variantId, tier } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const origin = req.headers.get("origin") ?? "";

    const body = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            embed: false,
          },
          checkout_data: {
            email: profile?.email || user.email,
            custom: {
              userId: user.id,
              tier,
            },
          },
          expires_at: null,
          redirect_url: `${origin}/home?success=true`,
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: Deno.env.get("LEMONSQUEEZY_STORE_ID") ?? "",
            },
          },
          variant: {
            data: {
              type: "variants",
              id: String(variantId),
            },
          },
        },
      },
    };

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("LemonSqueezy checkout error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const json = await res.json();
    const url = json.data?.attributes?.url as string | undefined;

    return new Response(
      JSON.stringify({ url }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

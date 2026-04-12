import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const metric = JSON.parse(body);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { db: { schema: 'veilor' } }
    );

    // JWT에서 user_id 추출 (있으면)
    let user_id: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      user_id = data.user?.id ?? null;
    }

    const { error } = await supabase.from('web_vitals').insert({
      metric_name:      metric.name,
      value:            metric.value,
      rating:           metric.rating,
      delta:            metric.delta,
      metric_id:        metric.id,
      navigation_type:  metric.navigationType,
      url:              metric.url,
      user_agent:       req.headers.get('User-Agent'),
      user_id,
    });

    if (error) {
      console.error('web_vitals insert error:', error.message);
      return new Response('DB error', { status: 500, headers: corsHeaders });
    }

    return new Response('ok', { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('collect-vitals error:', err);
    return new Response('Bad request', { status: 400, headers: corsHeaders });
  }
});

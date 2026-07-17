import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const MP_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") ?? ""
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://ahlembrei.com.br"

const PLANS: Record<string, Record<string, number>> = {
  basic: { monthly: 4.99, yearly: 44.90 },
  premium: { monthly: 9.9, yearly: 89.90 },
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() })
  }

  try {
    const body = await req.json()
    const { plan, billing, userId, userEmail } = body

    const amount = PLANS[plan]?.[billing]
    if (!amount) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      })
    }

    const mpRes = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payer_email: userEmail,
        reason: `AhLembrei ${plan === "basic" ? "B\u00e1sico" : "Premium"} - ${billing === "monthly" ? "Mensal" : "Anual"}`,
        external_reference: `${userId}-${plan}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: billing === "monthly" ? "months" : "years",
          transaction_amount: amount,
          currency_id: "BRL",
        },
        back_url: `${SITE_URL}/dashboard`,
      }),
    })

    const mpData = await mpRes.json()
    if (!mpRes.ok) {
      throw new Error(mpData.message || mpData.error || JSON.stringify(mpData))
    }

    return new Response(JSON.stringify({ init_point: mpData.init_point, id: mpData.id }), {
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    })
  }
})

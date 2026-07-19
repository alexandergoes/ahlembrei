import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const MP_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!
const SITE_URL = Deno.env.get("SITE_URL")!
const WEBHOOK_URL = Deno.env.get("WEBHOOK_URL")!

const PLANS: Record<string, Record<string, number>> = {
  basic: { monthly: 4.99, yearly: 44.90 },
  premium: { monthly: 9.9, yearly: 89.90 },
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    const { plan, billing, userId, userEmail } = await req.json()
    const amount = PLANS[plan]?.[billing]
    if (!amount) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
        back_urls: {
          success: `${SITE_URL}/dashboard?payment=success&plan=${plan}`,
          failure: `${SITE_URL}/dashboard?payment=failure`,
          pending: `${SITE_URL}/dashboard?payment=pending`,
        },
        notification_url: WEBHOOK_URL,
      }),
    })

    const data = await mpRes.json()
    if (!mpRes.ok) throw new Error(data.message || data.error || "MP error")

    return new Response(JSON.stringify({ init_point: data.init_point, id: data.id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  }
})

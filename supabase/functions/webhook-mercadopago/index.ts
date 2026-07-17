import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

async function hexDigest(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" },
    false, ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

serve(async (req) => {
  try {
    const xSignature = req.headers.get("x-signature")
    const xRequestId = req.headers.get("x-request-id")
    const clientSecret = Deno.env.get("MERCADO_PAGO_CLIENT_SECRET")
    const bodyText = await req.text()

    if (xSignature && xRequestId && clientSecret) {
      const parts = xSignature.split(",")
      const ts = parts.find((p) => p.trim().startsWith("ts="))?.split("=")[1]
      const hash = parts.find((p) => p.trim().startsWith("v1="))?.split("=")[1]
      if (ts && hash) {
        const dataId = JSON.parse(bodyText)?.data?.id || ""
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
        const expected = await hexDigest(manifest, clientSecret)
        if (hash !== expected) {
          return new Response("Unauthorized", { status: 401 })
        }
      }
    }

    const payload = JSON.parse(bodyText)
    const { action, data } = payload

    if (["subscription_created", "subscription_updated", "subscription_cancelled"].includes(action) && data?.id) {
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { Authorization: `Bearer ${Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!}` },
      })
      const sub = await mpRes.json()
      const extRef = sub?.external_reference

      if (extRef) {
        const [userId, plan] = extRef.split("-")
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        )
        await supabase.rpc("admin_update_plan", { user_id: userId, new_plan: plan })
      }
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("Webhook error:", err)
    return new Response("OK", { status: 200 })
  }
})

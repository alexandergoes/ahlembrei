import express from 'express';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});
const preApproval = new PreApproval(mpClient);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf.toString(); } }));

app.post('/api/webhook/mercadopago', async (req, res) => {
  try {
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];

    if (xSignature && xRequestId) {
      const parts = xSignature.split(',');
      const ts = parts.find(p => p.trim().startsWith('ts='))?.split('=')[1];
      const hash = parts.find(p => p.trim().startsWith('v1='))?.split('=')[1];
      const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
      if (ts && hash && clientSecret) {
        const manifest = `id:${req.body?.data?.id};request-id:${xRequestId};ts:${ts};`;
        const expected = crypto.createHmac('sha256', clientSecret).update(manifest).digest('hex');
        if (hash !== expected) return res.sendStatus(401);
      }
    }

    const { action, data } = req.body;
    if (['subscription_created', 'subscription_updated', 'subscription_cancelled'].includes(action) && data?.id) {
      const sub = await preApproval.get({ id: data.id });
      const extRef = sub?.external_reference;
      if (extRef) {
        const [userId, plan] = extRef.split('-');
        await supabase.rpc('admin_update_plan', { user_id: userId, new_plan: plan });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(200);
  }
});

app.post('/api/create-subscription', async (req, res) => {
  const { plan, billing, userId, userEmail } = req.body;
  const plans = {
    basic: { monthly: 4.99, yearly: 44.90 },
    premium: { monthly: 9.9, yearly: 89.90 },
  };
  const amount = plans[plan]?.[billing];
  if (!amount) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const result = await preApproval.create({
      body: {
        payer_email: userEmail,
        reason: `AhLembrei ${plan === 'basic' ? 'Básico' : 'Premium'} - ${billing === 'monthly' ? 'Mensal' : 'Anual'}`,
        external_reference: `${userId}-${plan}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: billing === 'monthly' ? 'months' : 'years',
          transaction_amount: amount,
          currency_id: 'BRL',
        },
        back_urls: {
          success: `${process.env.SITE_URL}/dashboard?payment=success&plan=${plan}`,
          failure: `${process.env.SITE_URL}/dashboard?payment=failure`,
          pending: `${process.env.SITE_URL}/dashboard?payment=pending`,
        },
        notification_url: `${process.env.SITE_URL}/api/webhook/mercadopago`,
      },
    });

    res.json({ init_point: result.init_point, id: result.id });
  } catch (err) {
    console.error('MP error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`AhLembrei running on port ${PORT}`);
});

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});
const preApproval = new PreApproval(mpClient);

app.use(express.json());

app.post('/api/webhook/mercadopago', async (req, res) => {
  res.sendStatus(200);
});

app.post('/api/create-subscription', async (req, res) => {
  const { plan, billing, userId, userEmail } = req.body;
  const plans = {
    basic: { monthly: 3.99, yearly: 39 },
    premium: { monthly: 9.9, yearly: 99 },
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

app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`AhLembrei running on port ${PORT}`);
});

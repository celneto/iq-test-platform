const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const TEST_PRICE = 2999; // R$ 29,99 em centavos

// Criar sessão de checkout
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Teste de QI Profissional',
              description: 'Teste completo de QI com 15 questões e análise detalhada'
            },
            unit_amount: TEST_PRICE
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.CORS_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/cancel`,
      customer_email: req.body.email || undefined
    });

    // Salvar registro de pagamento pendente
    const paymentId = uuidv4();
    db.run(
      'INSERT INTO payments (id, user_id, amount, currency, stripe_payment_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [paymentId, req.userId, TEST_PRICE / 100, 'BRL', session.id, 'pending']
    );

    res.json({ 
      sessionId: session.id,
      paymentId: paymentId,
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
});

// Verificar status do pagamento
router.get('/verify-payment/:session_id', verifyToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.session_id);

    if (session.payment_status === 'paid') {
      // Atualizar status do pagamento no banco de dados
      db.run(
        'UPDATE payments SET status = ? WHERE stripe_payment_id = ?',
        ['completed', session.id]
      );

      res.json({ 
        status: 'paid',
        message: 'Pagamento confirmado com sucesso'
      });
    } else {
      res.json({ 
        status: 'unpaid',
        message: 'Pagamento ainda não foi processado'
      });
    }
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
});

// Webhook para confirmar pagamento (opcional, para produção)
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Atualizar pagamento como concluído
      db.run(
        'UPDATE payments SET status = ? WHERE stripe_payment_id = ?',
        ['completed', session.id]
      );
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;


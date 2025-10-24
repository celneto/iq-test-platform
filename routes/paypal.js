const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

const router = express.Router();

const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'production' 
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

const TEST_PRICE = 29.99;

// Gerar token de acesso PayPal
async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter token PayPal:', error.message);
    throw error;
  }
}

// Criar ordem de pagamento
router.post('/create-order', async (req, res) => {
  try {
    const { email, test_answers } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const accessToken = await getPayPalAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'BRL',
            value: TEST_PRICE.toString()
          },
          description: 'Análise Detalhada de Teste de QI'
        }
      ],
      payer: {
        email_address: email
      },
      return_url: `${process.env.CORS_ORIGIN}/payment-success`,
      cancel_url: `${process.env.CORS_ORIGIN}/payment-cancel`
    };

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const orderId = response.data.id;

    // Salvar ordem no banco de dados
    const paymentId = uuidv4();
    db.run(
      `INSERT INTO payments (id, user_id, amount, currency, stripe_payment_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, 'guest', TEST_PRICE, 'BRL', orderId, 'pending'],
      (err) => {
        if (err) {
          console.error('Erro ao salvar pagamento:', err);
        }
      }
    );

    // Encontrar o link de aprovação
    const approvalLink = response.data.links.find(link => link.rel === 'approve');

    res.json({
      orderId: orderId,
      approvalLink: approvalLink.href
    });
  } catch (error) {
    console.error('Erro ao criar ordem PayPal:', error);
    res.status(500).json({ error: 'Erro ao criar ordem de pagamento' });
  }
});

// Capturar pagamento após aprovação
router.post('/capture-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.body;

    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'COMPLETED') {
      // Atualizar status do pagamento
      db.run(
        'UPDATE payments SET status = ? WHERE stripe_payment_id = ?',
        ['completed', orderId]
      );

      // Gerar relatório de QI (será implementado)
      const resultId = uuidv4();

      res.json({
        status: 'success',
        message: 'Pagamento realizado com sucesso!',
        orderId: orderId,
        resultId: resultId,
        email: email
      });
    } else {
      res.status(400).json({ error: 'Pagamento não foi completado' });
    }
  } catch (error) {
    console.error('Erro ao capturar pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// Webhook PayPal (opcional)
router.post('/webhook', (req, res) => {
  const event = req.body;

  // Verificar tipo de evento
  if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
    const orderId = event.resource.id;
    
    // Atualizar status do pagamento
    db.run(
      'UPDATE payments SET status = ? WHERE stripe_payment_id = ?',
      ['completed', orderId]
    );
  }

  res.json({ received: true });
});

module.exports = router;


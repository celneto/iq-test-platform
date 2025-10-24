// Integração PayPal

// Função para iniciar pagamento PayPal
async function initiatePayPalPayment(email) {
  try {
    // Criar ordem PayPal
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        test_answers: appState.answers
      })
    });

    const data = await response.json();

    if (response.ok && data.approvalLink) {
      // Redirecionar para PayPal
      window.location.href = data.approvalLink;
    } else {
      showAlert(data.error || 'Erro ao criar ordem de pagamento', 'error');
    }
  } catch (error) {
    showAlert('Erro ao processar pagamento: ' + error.message, 'error');
  }
}

// Função para capturar pagamento após retorno do PayPal
async function capturePayPalPayment(orderId, email) {
  try {
    const response = await fetch(`/api/paypal/capture-order/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email
      })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Pagamento realizado com sucesso!', 'success');
      // Redirecionar para página de resultados
      setTimeout(() => {
        window.location.href = '/results?orderId=' + orderId;
      }, 2000);
    } else {
      showAlert(data.error || 'Erro ao processar pagamento', 'error');
    }
  } catch (error) {
    showAlert('Erro ao capturar pagamento: ' + error.message, 'error');
  }
}

// Verificar se voltou do PayPal
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    // Usuário voltou do PayPal com token de aprovação
    const email = localStorage.getItem('paypal_email');
    if (email) {
      capturePayPalPayment(token, email);
      localStorage.removeItem('paypal_email');
    }
  }
});

// Função para iniciar pagamento (chamada do app.js)
function purchaseWithPayPal(email) {
  // Salvar email para usar após retorno do PayPal
  localStorage.setItem('paypal_email', email);
  
  // Iniciar pagamento
  initiatePayPalPayment(email);
}


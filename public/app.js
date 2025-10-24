// Estado da aplicação
const appState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentTestSession: null,
  questions: [],
  allQuestions: [],
  currentQuestionIndex: 0,
  answers: [],
  testStartTime: null,
  isGuestTest: false
};

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
  loadQuestions();
  updateUI();
  showSection('home');
});

// Carregar questões
async function loadQuestions() {
  try {
    const response = await fetch('/api/test/questions');
    const data = await response.json();
    appState.allQuestions = data.questions;
    shuffleAndSelectQuestions();
  } catch (error) {
    console.error('Erro ao carregar questões:', error);
  }
}

// Embaralhar perguntas e selecionar 32 aleatórias
function shuffleAndSelectQuestions() {
  // Embaralhar array
  const shuffled = [...appState.allQuestions].sort(() => Math.random() - 0.5);
  // Selecionar as primeiras 32
  appState.questions = shuffled.slice(0, 32);
  // Embaralhar as opções de cada pergunta
  appState.questions.forEach(question => {
    const correctAnswer = question.options[question.correct_answer];
    question.options = question.options.sort(() => Math.random() - 0.5);
    question.correct_answer = question.options.indexOf(correctAnswer);
  });
}

// Mostrar seção
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }

  if (sectionId === 'profile' && appState.token) {
    loadProfile();
  }
}

// Atualizar UI baseado no estado de autenticação
function updateUI() {
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');
  const profileLink = document.getElementById('profileLink');

  if (appState.token) {
    loginLink.style.display = 'none';
    logoutLink.style.display = 'block';
    profileLink.style.display = 'block';
  } else {
    loginLink.style.display = 'block';
    logoutLink.style.display = 'none';
    profileLink.style.display = 'none';
  }
}

// Registrar usuário
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      appState.token = data.token;
      appState.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUI();
      showAlert('Registro realizado com sucesso!', 'success');
      showSection('home');
      document.getElementById('registerForm').reset();
    } else {
      showAlert(data.error || 'Erro ao registrar', 'error');
    }
  } catch (error) {
    showAlert('Erro ao registrar: ' + error.message, 'error');
  }
}

// Login
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      appState.token = data.token;
      appState.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUI();
      showAlert('Login realizado com sucesso!', 'success');
      showSection('home');
      document.getElementById('loginForm').reset();
    } else {
      showAlert(data.error || 'Erro ao fazer login', 'error');
    }
  } catch (error) {
    showAlert('Erro ao fazer login: ' + error.message, 'error');
  }
}

// Logout
function logout() {
  appState.token = null;
  appState.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateUI();
  showAlert('Você saiu da conta', 'success');
  showSection('home');
}

// Carregar perfil
async function loadProfile() {
  if (!appState.token) {
    showSection('login');
    return;
  }

  try {
    const response = await fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${appState.token}` }
    });

    const user = await response.json();

    if (response.ok) {
      const profileContent = document.getElementById('profileContent');
      profileContent.innerHTML = `
        <div class="result-card">
          <p><strong>Nome:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Membro desde:</strong> ${new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
          <button class="btn btn-primary" onclick="loadUserResults()">Ver Meus Resultados</button>
        </div>
        <div id="userResults"></div>
      `;

      loadUserResults();
    }
  } catch (error) {
    showAlert('Erro ao carregar perfil: ' + error.message, 'error');
  }
}

// Carregar resultados do usuário
async function loadUserResults() {
  if (!appState.token) return;

  try {
    const response = await fetch('/api/results', {
      headers: { 'Authorization': `Bearer ${appState.token}` }
    });

    const results = await response.json();

    if (response.ok && results.length > 0) {
      const resultsHtml = results.map(result => `
        <div class="result-card">
          <p><strong>Data:</strong> ${new Date(result.created_at).toLocaleDateString('pt-BR')}</p>
          <p><strong>QI:</strong> ${result.iq_score}</p>
          <p><strong>Classificação:</strong> ${result.classification}</p>
          <button class="btn btn-primary" onclick="viewResult('${result.id}')">Ver Detalhes</button>
        </div>
      `).join('');

      document.getElementById('userResults').innerHTML = `
        <h3>Meus Testes</h3>
        ${resultsHtml}
      `;
    } else {
      document.getElementById('userResults').innerHTML = '<p>Você ainda não realizou nenhum teste.</p>';
    }
  } catch (error) {
    showAlert('Erro ao carregar resultados: ' + error.message, 'error');
  }
}

// Iniciar teste (SEM LOGIN NECESSÁRIO)
function startTest() {
  appState.isGuestTest = true;
  appState.currentQuestionIndex = 0;
  appState.answers = [];
  appState.testStartTime = Date.now();
  showSection('test');
  displayQuestion();
}

// Exibir questão
function displayQuestion() {
  const question = appState.questions[appState.currentQuestionIndex];
  const totalQuestions = appState.questions.length;
  const progress = ((appState.currentQuestionIndex + 1) / totalQuestions) * 100;

  document.getElementById('progressBar').style.width = progress + '%';
  document.getElementById('questionCounter').textContent = `Questão ${appState.currentQuestionIndex + 1} de ${totalQuestions}`;

  const optionsHtml = question.options.map((option, index) => `
    <label class="option">
      <input type="radio" name="answer" value="${index}" onchange="selectAnswer(${index})">
      ${option}
    </label>
  `).join('');

  const testContent = document.getElementById('testContent');
  testContent.innerHTML = `
    <div class="question">
      <h3>${question.question}</h3>
      <div class="options">
        ${optionsHtml}
      </div>
    </div>
    <div class="test-buttons">
      ${appState.currentQuestionIndex > 0 ? '<button class="btn btn-secondary" onclick="previousQuestion()">Anterior</button>' : ''}
      ${appState.currentQuestionIndex < appState.questions.length - 1 ? '<button class="btn btn-primary" onclick="nextQuestion()">Próxima</button>' : '<button class="btn btn-success" onclick="submitTest()">Finalizar Teste</button>'}
    </div>
  `;

  const previousAnswer = appState.answers.find(a => a.question_id === question.id);
  if (previousAnswer !== undefined) {
    const radioButton = document.querySelector(`input[name="answer"][value="${previousAnswer.answer}"]`);
    if (radioButton) {
      radioButton.checked = true;
    }
  }
}

// Selecionar resposta
function selectAnswer(answerIndex) {
  const question = appState.questions[appState.currentQuestionIndex];
  const existingAnswer = appState.answers.findIndex(a => a.question_id === question.id);

  if (existingAnswer !== -1) {
    appState.answers[existingAnswer].answer = answerIndex;
  } else {
    appState.answers.push({
      question_id: question.id,
      answer: answerIndex,
      time_spent: Math.floor((Date.now() - appState.testStartTime) / 1000)
    });
  }
}

// Próxima questão
function nextQuestion() {
  if (appState.currentQuestionIndex < appState.questions.length - 1) {
    appState.currentQuestionIndex++;
    displayQuestion();
  }
}

// Questão anterior
function previousQuestion() {
  if (appState.currentQuestionIndex > 0) {
    appState.currentQuestionIndex--;
    displayQuestion();
  }
}

// Submeter teste
function submitTest() {
  if (appState.answers.length < appState.questions.length) {
    showAlert('Por favor, responda todas as questões antes de finalizar', 'warning');
    return;
  }

  // Calcular respostas corretas
  let correctCount = 0;
  const answersWithCorrect = appState.answers.map(answer => {
    const question = appState.questions.find(q => q.id === answer.question_id);
    const isCorrect = answer.answer === question.correct_answer;
    if (isCorrect) correctCount++;
    return {
      question_id: answer.question_id,
      userAnswer: question.options[answer.answer],
      correctAnswer: question.options[question.correct_answer],
      isCorrect: isCorrect,
      questionText: question.question
    };
  });

  // Salvar respostas para uso após pagamento
  appState.testResults = {
    correctCount: correctCount,
    answersWithCorrect: answersWithCorrect,
    totalQuestions: appState.questions.length
  };

  // Exibir resultados SEM mostrar respostas
  displayResultsWithoutAnswers(correctCount);
}

// Exibir resultados SEM mostrar respostas (pedir pagamento)
function displayResultsWithoutAnswers(correctCount) {
  const percentage = Math.round((correctCount / appState.questions.length) * 100);
  
  const resultsContent = document.getElementById('resultsContent');
  resultsContent.innerHTML = `
    <div class="result-card">
      <h3>Teste Concluído!</h3>
      <div class="result-score">${correctCount}/${appState.questions.length}</div>
      <p style="text-align: center; font-size: 1.2rem; color: #2563eb; margin: 1rem 0;">
        <strong>Você acertou ${percentage}% das questões</strong>
      </p>

      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin: 2rem 0;">
        <p><strong>🎯 Quer ver suas respostas e análise detalhada de QI?</strong></p>
        <p>Pague apenas <strong>R$ 29,99</strong> para desbloquear:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Seu Quociente de Inteligência (QI) preciso</li>
          <li>Análise por área cognitiva</li>
          <li>Classificação de inteligência</li>
          <li>Comparação com população geral</li>
          <li>Revisão completa de suas respostas</li>
          <li>Relatório detalhado em PDF</li>
        </ul>
      </div>

      <div style="margin-top: 2rem; text-align: center;">
        <button class="btn btn-primary" onclick="purchaseDetailedResults()" style="padding: 1rem 2rem; font-size: 1.1rem;">
          🔓 Desbloquear Análise Completa - R$ 29,99
        </button>
        <button class="btn btn-secondary" onclick="showSection('home')" style="margin-left: 1rem;">
          Voltar ao Início
        </button>
      </div>
    </div>
  `;

  showSection('results');
}

// Comprar análise detalhada
async function purchaseDetailedResults() {
  // Se não estiver logado, pedir para fazer login ou continuar como guest
  if (!appState.token) {
    const userChoice = confirm('Você precisa fazer login ou fornecer um email para receber a análise.\n\nDeseja fazer login agora?');
    
    if (userChoice) {
      showSection('login');
      return;
    } else {
      // Continuar como guest - pedir email
      const email = prompt('Digite seu email para receber a análise:');
      if (!email) return;
      
      proceedToPayment(email);
      return;
    }
  }

  // Se estiver logado, usar email do usuário
  proceedToPayment(appState.user.email);
}

// Prosseguir para pagamento com Stripe
function proceedToPayment(email) {
  // Salvar email para usar após retorno do Stripe
  localStorage.setItem('test_email', email);
  localStorage.setItem('test_results', JSON.stringify(appState.testResults));
  
  // Iniciar pagamento com Stripe
  initiateStripePayment(email);
}

// Iniciar pagamento Stripe
async function initiateStripePayment(email) {
  try {
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(appState.token && { 'Authorization': `Bearer ${appState.token}` })
      },
      body: JSON.stringify({
        email: email,
        test_answers: appState.answers
      })
    });

    const data = await response.json();

    if (response.ok && data.url) {
      // Redirecionar para Stripe Checkout
      window.location.href = data.url;
    } else {
      showAlert(data.error || 'Erro ao criar sessão de pagamento', 'error');
    }
  } catch (error) {
    showAlert('Erro ao processar pagamento: ' + error.message, 'error');
  }
}

// Exibir alerta
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '100px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '1000';
  alertDiv.style.maxWidth = '400px';

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}


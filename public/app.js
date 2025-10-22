// Estado da aplicação
const appState = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentTestSession: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  testStartTime: null
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
    appState.questions = data.questions;
  } catch (error) {
    console.error('Erro ao carregar questões:', error);
  }
}

// Mostrar seção
function showSection(sectionId) {
  // Esconder todas as seções
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Mostrar seção selecionada
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }

  // Carregar conteúdo específico
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

// Iniciar teste
async function startTest() {
  if (!appState.token) {
    showAlert('Você precisa fazer login para realizar o teste', 'warning');
    showSection('login');
    return;
  }

  try {
    const response = await fetch('/api/test/start', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${appState.token}` }
    });

    const data = await response.json();

    if (response.ok) {
      appState.currentTestSession = data.test_session_id;
      appState.currentQuestionIndex = 0;
      appState.answers = [];
      appState.testStartTime = Date.now();
      showSection('test');
      displayQuestion();
    } else {
      showAlert(data.error || 'Erro ao iniciar teste', 'error');
    }
  } catch (error) {
    showAlert('Erro ao iniciar teste: ' + error.message, 'error');
  }
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

  // Restaurar resposta anterior se existir
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
async function submitTest() {
  if (appState.answers.length < appState.questions.length) {
    showAlert('Por favor, responda todas as questões antes de finalizar', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/test/submit-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appState.token}`
      },
      body: JSON.stringify({
        test_session_id: appState.currentTestSession,
        answers: appState.answers
      })
    });

    const data = await response.json();

    if (response.ok) {
      displayResults(data);
    } else {
      showAlert(data.error || 'Erro ao submeter teste', 'error');
    }
  } catch (error) {
    showAlert('Erro ao submeter teste: ' + error.message, 'error');
  }
}

// Exibir resultados
function displayResults(results) {
  const resultsContent = document.getElementById('resultsContent');
  resultsContent.innerHTML = `
    <div class="result-card">
      <h3>Seu Quociente de Inteligência (QI)</h3>
      <div class="result-score">${results.iq_score}</div>
      <div class="result-classification">${results.classification}</div>
      <p style="text-align: center; color: #6b7280;">Percentil: ${results.percentile}%</p>
      
      <h3 style="margin-top: 2rem;">Análise por Área</h3>
      <div class="result-details">
        <div class="result-detail">
          <div class="result-detail-label">Compreensão Verbal</div>
          <div class="result-detail-value">${results.verbal_index}</div>
        </div>
        <div class="result-detail">
          <div class="result-detail-label">Organização Perceptual</div>
          <div class="result-detail-value">${results.perceptual_index}</div>
        </div>
        <div class="result-detail">
          <div class="result-detail-label">Memória Operacional</div>
          <div class="result-detail-value">${results.memory_index}</div>
        </div>
        <div class="result-detail">
          <div class="result-detail-label">Velocidade de Processamento</div>
          <div class="result-detail-value">${results.processing_speed_index}</div>
        </div>
      </div>

      <p style="margin-top: 2rem; padding: 1rem; background-color: var(--light-bg); border-radius: 0.5rem;">
        <strong>Sobre seu resultado:</strong> Sua pontuação de QI foi comparada com a população geral. 
        Uma pontuação de 100 representa a média, com um desvio padrão de 15 pontos. 
        Sua classificação indica seu desempenho em relação aos pares.
      </p>

      <div style="margin-top: 2rem; text-align: center;">
        <button class="btn btn-primary" onclick="showSection('home')">Voltar ao Início</button>
        <button class="btn btn-secondary" onclick="downloadResults('${results.result_id}')">Baixar Relatório</button>
      </div>
    </div>
  `;

  showSection('results');
}

// Baixar resultados (placeholder)
function downloadResults(resultId) {
  showAlert('Funcionalidade de download será implementada em breve', 'warning');
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


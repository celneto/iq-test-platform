const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
const dbPath = path.join(dbDir, 'iq_test.db');

// Criar diretório se não existir
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de pagamentos
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'BRL',
      stripe_payment_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tabela de testes realizados
  db.run(`
    CREATE TABLE IF NOT EXISTS test_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      payment_id TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      status TEXT DEFAULT 'in_progress',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    )
  `);

  // Tabela de respostas do teste
  db.run(`
    CREATE TABLE IF NOT EXISTS test_answers (
      id TEXT PRIMARY KEY,
      test_session_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      answer TEXT,
      is_correct BOOLEAN,
      time_spent INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_session_id) REFERENCES test_sessions(id)
    )
  `);

  // Tabela de resultados
  db.run(`
    CREATE TABLE IF NOT EXISTS test_results (
      id TEXT PRIMARY KEY,
      test_session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      total_score INTEGER,
      iq_score REAL,
      verbal_index REAL,
      perceptual_index REAL,
      memory_index REAL,
      processing_speed_index REAL,
      classification TEXT,
      percentile REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_session_id) REFERENCES test_sessions(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Banco de dados inicializado com sucesso');
}

module.exports = db;


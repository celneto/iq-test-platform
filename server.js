const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Importar rotas
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const paymentRoutes = require('./routes/payment');
const resultsRoutes = require('./routes/results');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/results', resultsRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


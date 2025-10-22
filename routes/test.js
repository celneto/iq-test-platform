const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');
const questions = require('../data/questions.json');

const router = express.Router();

// Obter todas as questões
router.get('/questions', (req, res) => {
  res.json(questions);
});

// Iniciar uma nova sessão de teste
router.post('/start', verifyToken, (req, res) => {
  const testSessionId = uuidv4();
  const userId = req.userId;

  db.run(
    'INSERT INTO test_sessions (id, user_id, status) VALUES (?, ?, ?)',
    [testSessionId, userId, 'in_progress'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao iniciar teste' });
      }
      res.status(201).json({ 
        message: 'Teste iniciado',
        test_session_id: testSessionId
      });
    }
  );
});

// Submeter respostas do teste
router.post('/submit-answers', verifyToken, (req, res) => {
  const { test_session_id, answers } = req.body;

  if (!test_session_id || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'test_session_id e answers são obrigatórios' });
  }

  // Validar que o teste pertence ao usuário
  db.get(
    'SELECT * FROM test_sessions WHERE id = ? AND user_id = ?',
    [test_session_id, req.userId],
    (err, session) => {
      if (err || !session) {
        return res.status(403).json({ error: 'Sessão de teste não encontrada' });
      }

      // Processar respostas
      let totalScore = 0;
      const categoryScores = {
        verbal: 0,
        perceptual: 0,
        memory: 0,
        processing_speed: 0
      };
      const categoryCount = {
        verbal: 0,
        perceptual: 0,
        memory: 0,
        processing_speed: 0
      };

      answers.forEach((answer) => {
        const question = questions.questions.find(q => q.id === answer.question_id);
        if (question) {
          const isCorrect = answer.answer === question.correct_answer;
          const points = isCorrect ? 1 : 0;
          
          totalScore += points;
          categoryScores[question.category] += points;
          categoryCount[question.category] += 1;

          // Salvar resposta no banco de dados
          db.run(
            'INSERT INTO test_answers (id, test_session_id, question_id, answer, is_correct, time_spent) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), test_session_id, answer.question_id, answer.answer, isCorrect ? 1 : 0, answer.time_spent || 0]
          );
        }
      });

      // Calcular índices por categoria
      const calculateIndex = (score, count) => {
        if (count === 0) return 100;
        return (score / count) * 15 + 100; // Escala com média 100 e DP 15
      };

      const verbalIndex = calculateIndex(categoryScores.verbal, categoryCount.verbal);
      const perceptualIndex = calculateIndex(categoryScores.perceptual, categoryCount.perceptual);
      const memoryIndex = calculateIndex(categoryScores.memory, categoryCount.memory);
      const processingSpeedIndex = calculateIndex(categoryScores.processing_speed, categoryCount.processing_speed);

      // Calcular QI total
      const iqScore = (verbalIndex + perceptualIndex + memoryIndex + processingSpeedIndex) / 4;

      // Classificar resultado
      let classification = 'Média';
      if (iqScore >= 130) classification = 'Muito Superior';
      else if (iqScore >= 120) classification = 'Superior';
      else if (iqScore >= 110) classification = 'Acima da Média';
      else if (iqScore >= 90) classification = 'Média';
      else if (iqScore >= 80) classification = 'Abaixo da Média';
      else if (iqScore >= 70) classification = 'Limítrofe';
      else classification = 'Extremamente Baixo';

      // Calcular percentil (aproximado)
      const percentile = (iqScore - 55) / 90 * 100;

      // Salvar resultados
      const resultId = uuidv4();
      db.run(
        `INSERT INTO test_results 
         (id, test_session_id, user_id, total_score, iq_score, verbal_index, perceptual_index, memory_index, processing_speed_index, classification, percentile)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [resultId, test_session_id, req.userId, totalScore, iqScore, verbalIndex, perceptualIndex, memoryIndex, processingSpeedIndex, classification, percentile],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao salvar resultados' });
          }

          // Atualizar status da sessão
          db.run(
            'UPDATE test_sessions SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['completed', test_session_id]
          );

          res.json({
            message: 'Teste concluído com sucesso',
            result_id: resultId,
            total_score: totalScore,
            iq_score: Math.round(iqScore * 100) / 100,
            verbal_index: Math.round(verbalIndex * 100) / 100,
            perceptual_index: Math.round(perceptualIndex * 100) / 100,
            memory_index: Math.round(memoryIndex * 100) / 100,
            processing_speed_index: Math.round(processingSpeedIndex * 100) / 100,
            classification: classification,
            percentile: Math.round(percentile * 100) / 100
          });
        }
      );
    }
  );
});

module.exports = router;


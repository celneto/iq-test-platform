const express = require('express');
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Obter resultado de um teste específico
router.get('/:result_id', verifyToken, (req, res) => {
  db.get(
    'SELECT * FROM test_results WHERE id = ? AND user_id = ?',
    [req.params.result_id, req.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar resultado' });
      }

      if (!result) {
        return res.status(404).json({ error: 'Resultado não encontrado' });
      }

      res.json(result);
    }
  );
});

// Obter todos os resultados do usuário
router.get('/', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM test_results WHERE user_id = ? ORDER BY created_at DESC',
    [req.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar resultados' });
      }

      res.json(results || []);
    }
  );
});

// Gerar relatório PDF (endpoint placeholder)
router.get('/:result_id/pdf', verifyToken, (req, res) => {
  db.get(
    'SELECT * FROM test_results WHERE id = ? AND user_id = ?',
    [req.params.result_id, req.userId],
    (err, result) => {
      if (err || !result) {
        return res.status(404).json({ error: 'Resultado não encontrado' });
      }

      // Aqui você poderia usar uma biblioteca como pdfkit para gerar o PDF
      // Por enquanto, retornamos os dados em JSON
      res.json({
        message: 'Funcionalidade de PDF será implementada em produção',
        data: result
      });
    }
  );
});

module.exports = router;


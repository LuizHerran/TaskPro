import { Router } from 'express';
import { sqlite } from '../db.js';

export const mensagensRouter = Router();

mensagensRouter.get('/', (req, res) => {
  try {
    const mensagens = sqlite.prepare(`
      SELECT
        mensagens.*,

        remetente.nome    AS remetente_nome,
        destinatario.nome AS destinatario_nome

      FROM mensagens

      JOIN usuarios AS remetente
        ON remetente.id = mensagens.remetente_id

      JOIN usuarios AS destinatario
        ON destinatario.id = mensagens.destinatario_id

      ORDER BY mensagens.created_at DESC
    `).all();
    res.json(mensagens);
  } catch (error) {
    res.status(500).json(error);
  }
});

mensagensRouter.get('/:id', (req, res) => {
  try {
    const mensagem = sqlite.prepare(`
      SELECT
        mensagens.*,

        remetente.nome    AS remetente_nome,
        destinatario.nome AS destinatario_nome

      FROM mensagens

      JOIN usuarios AS remetente
        ON remetente.id = mensagens.remetente_id

      JOIN usuarios AS destinatario
        ON destinatario.id = mensagens.destinatario_id

      WHERE mensagens.id = ?
    `).get(req.params.id);
    if (!mensagem) {
      return res.status(404).json({
        message: 'Mensagem não encontrada'
      });
    }
    res.json(mensagem);
  } catch (error) {
    res.status(500).json(error);
  }
});

mensagensRouter.post('/', (req, res) => {
  try {
    const {
      remetente_id,
      destinatario_id,
      pedido_id,
      conteudo
    } = req.body;
    const result = sqlite.prepare(`
      INSERT INTO mensagens (
        remetente_id,
        destinatario_id,
        pedido_id,
        conteudo
      )
      VALUES (?, ?, ?, ?)
    `).run(
      remetente_id,
      destinatario_id,
      pedido_id || null,
      conteudo
    );
    res.status(201).json({
      id: result.lastInsertRowid,
      remetente_id,
      destinatario_id,
      pedido_id,
      conteudo
    });
  } catch (error) {
    res.status(500).json(error);
  }
});


mensagensRouter.put('/:id/lida', (req, res) => {
  try {
    sqlite.prepare(`
      UPDATE mensagens
      SET lida = 1
      WHERE id = ?
    `).run(req.params.id);
    res.json({
      message: 'Mensagem marcada como lida'
    });
  } catch (error) {
    res.status(500).json(error);
  }
});


mensagensRouter.delete('/:id', (req, res) => {
  try {
    sqlite.prepare(`
      DELETE FROM mensagens
      WHERE id = ?
    `).run(req.params.id);
    res.json({
      message: 'Mensagem removida'
    });
  } catch (error) {
    res.status(500).json(error);
  }
//novo

});

  mensagensRouter.get('/conversa/:usuario1/:usuario2', (req, res) => {
  try {
    const { usuario1, usuario2 } = req.params;

    const mensagens = sqlite.prepare(`
      SELECT *
      FROM mensagens
      WHERE
        (remetente_id = ? AND destinatario_id = ?)
        OR
        (remetente_id = ? AND destinatario_id = ?)
      ORDER BY created_at ASC
    `).all(
      usuario1,
      usuario2,
      usuario2,
      usuario1
    );

    res.json(mensagens);
  } catch (error) {
    res.status(500).json(error);
  }
});

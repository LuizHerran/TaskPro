import { Router } from 'express';
import { sqlite } from '../db.js';

export const favoritosRouter = Router();

// GET /api/favoritos?cliente_id=X  → lista os marceneiros favoritados
favoritosRouter.get('/', (req, res) => {
  const { cliente_id } = req.query;
  if (!cliente_id) return res.status(400).json({ error: 'cliente_id obrigatório' });

  const rows = sqlite.prepare(`
    SELECT f.id, f.created_at,
           u.id AS marceneiro_id, u.nome, u.bio, u.cidade, u.estado,
           u.avaliacao_media, u.total_projetos, u.total_avaliacoes, u.avatar, u.destaque
    FROM favoritos f
    JOIN usuarios u ON f.marceneiro_id = u.id
    WHERE f.cliente_id = ?
    ORDER BY f.created_at DESC
  `).all(cliente_id);

  res.json(rows);
});

// POST /api/favoritos  → adicionar favorito
favoritosRouter.post('/', (req, res) => {
  const { cliente_id, marceneiro_id } = req.body;
  if (!cliente_id || !marceneiro_id)
    return res.status(400).json({ error: 'cliente_id e marceneiro_id obrigatórios' });

  try {
    const r = sqlite.prepare(
      'INSERT INTO favoritos (cliente_id, marceneiro_id) VALUES (?, ?)'
    ).run(cliente_id, marceneiro_id);
    res.status(201).json({ id: r.lastInsertRowid, cliente_id, marceneiro_id });
  } catch {
    res.status(409).json({ error: 'Já está nos favoritos' });
  }
});

// DELETE /api/favoritos?cliente_id=X&marceneiro_id=Y  → remover favorito
favoritosRouter.delete('/', (req, res) => {
  const { cliente_id, marceneiro_id } = req.query;
  if (!cliente_id || !marceneiro_id)
    return res.status(400).json({ error: 'Parâmetros obrigatórios' });

  sqlite.prepare(
    'DELETE FROM favoritos WHERE cliente_id = ? AND marceneiro_id = ?'
  ).run(cliente_id, marceneiro_id);
  res.json({ message: 'Removido dos favoritos' });
});

// GET /api/favoritos/check?cliente_id=X&marceneiro_id=Y  → checar se é favorito
favoritosRouter.get('/check', (req, res) => {
  const { cliente_id, marceneiro_id } = req.query;
  const row = sqlite.prepare(
    'SELECT id FROM favoritos WHERE cliente_id = ? AND marceneiro_id = ?'
  ).get(cliente_id, marceneiro_id);
  res.json({ favorito: !!row });
});

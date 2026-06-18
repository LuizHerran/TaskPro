import { Router } from 'express';
import { sqlite } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { marceneiro_id, categoria_id } = req.query;
  let sql = `
    SELECT s.*, c.nome as categoria_nome
    FROM servicos s
    LEFT JOIN categorias c ON s.categoria_id = c.id
    WHERE s.status = 'ATIVO'
  `;
  const params: any[] = [];
  if (marceneiro_id) { sql += ' AND s.marceneiro_id = ?'; params.push(marceneiro_id); }
  if (categoria_id) { sql += ' AND s.categoria_id = ?'; params.push(categoria_id); }
  sql += ' ORDER BY s.created_at DESC';

  try { res.json(sqlite.prepare(sql).all(...params)); }
  catch (err) { res.status(500).json({ error: 'Erro ao buscar serviços' }); }
});

router.get('/:id', (req, res) => {
  const svc = sqlite.prepare(`
    SELECT s.*, c.nome as categoria_nome
    FROM servicos s
    LEFT JOIN categorias c ON s.categoria_id = c.id
    WHERE s.id = ?
  `).get(req.params.id);
  if (!svc) return res.status(404).json({ error: 'Serviço não encontrado' });
  res.json(svc);
});

router.post('/', (req, res) => {
  const { titulo, descricao, preco_base, marceneiro_id, categoria_id, tempo_estimado } = req.body;
  if (!titulo || !marceneiro_id || !categoria_id || preco_base == null) {
    return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
  }
  try {
    const stmt = sqlite.prepare(`
      INSERT INTO servicos (titulo, descricao, preco_base, marceneiro_id, categoria_id, tempo_estimado)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(titulo, descricao || '', preco_base, marceneiro_id, categoria_id, tempo_estimado || null);
    const newSvc = sqlite.prepare('SELECT * FROM servicos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newSvc);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

export default router;
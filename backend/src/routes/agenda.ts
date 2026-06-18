import { Router } from 'express';
import { sqlite } from '../db.js';

export const agendaRouter = Router();

// GET /api/agenda?marceneiro_id=X&data=YYYY-MM-DD
agendaRouter.get('/', (req, res) => {
  const { marceneiro_id, data } = req.query;
  if (!marceneiro_id) return res.status(400).json({ error: 'marceneiro_id obrigatório' });

  let query = `
    SELECT a.*, p.descricao AS pedido_descricao, u.nome AS cliente_nome
    FROM agenda a
    LEFT JOIN pedidos p ON a.pedido_id = p.id
    LEFT JOIN usuarios u ON p.cliente_id = u.id
    WHERE a.marceneiro_id = ?
  `;
  const params: unknown[] = [marceneiro_id];

  if (data) { query += ' AND a.data = ?'; params.push(data); }
  query += ' ORDER BY a.data ASC, a.hora_inicio ASC';

  res.json(sqlite.prepare(query).all(...params));
});

// POST /api/agenda  → criar slot de agenda
agendaRouter.post('/', (req, res) => {
  const { marceneiro_id, data, hora_inicio, hora_fim, observacao } = req.body;
  if (!marceneiro_id || !data || !hora_inicio || !hora_fim)
    return res.status(400).json({ error: 'Campos obrigatórios: marceneiro_id, data, hora_inicio, hora_fim' });

  const r = sqlite.prepare(`
    INSERT INTO agenda (marceneiro_id, data, hora_inicio, hora_fim, observacao)
    VALUES (?, ?, ?, ?, ?)
  `).run(marceneiro_id, data, hora_inicio, hora_fim, observacao ?? null);

  res.status(201).json(sqlite.prepare('SELECT * FROM agenda WHERE id = ?').get(r.lastInsertRowid));
});

// PUT /api/agenda/:id  → atualizar slot (disponivel, pedido_id, observacao)
agendaRouter.put('/:id', (req, res) => {
  const { disponivel, pedido_id, observacao, hora_inicio, hora_fim } = req.body;
  sqlite.prepare(`
    UPDATE agenda SET disponivel=?, pedido_id=?, observacao=?, hora_inicio=?, hora_fim=?
    WHERE id=?
  `).run(disponivel ?? 1, pedido_id ?? null, observacao ?? null, hora_inicio, hora_fim, req.params.id);

  res.json(sqlite.prepare('SELECT * FROM agenda WHERE id = ?').get(req.params.id));
});

// DELETE /api/agenda/:id
agendaRouter.delete('/:id', (req, res) => {
  sqlite.prepare('DELETE FROM agenda WHERE id = ?').run(req.params.id);
  res.json({ message: 'Slot removido' });
});

import { Router } from 'express';
import { sqlite } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { cliente_id, marceneiro_id } = req.query;
  let sql = `
    SELECT p.*, s.titulo as servico_titulo,
           c.nome as cliente_nome, m.nome as marceneiro_nome
    FROM pedidos p
    JOIN servicos s ON p.servico_id = s.id
    JOIN usuarios c ON p.cliente_id = c.id
    JOIN usuarios m ON p.marceneiro_id = m.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (cliente_id) { sql += ' AND p.cliente_id = ?'; params.push(cliente_id); }
  if (marceneiro_id) { sql += ' AND p.marceneiro_id = ?'; params.push(marceneiro_id); }
  sql += ' ORDER BY p.created_at DESC';

  try { res.json(sqlite.prepare(sql).all(...params)); }
  catch (err) { res.status(500).json({ error: 'Erro ao buscar pedidos' }); }
});

router.get('/:id', (req, res) => {
  const pedido = sqlite.prepare(`
    SELECT p.*, s.titulo as servico_titulo,
           c.nome as cliente_nome, m.nome as marceneiro_nome
    FROM pedidos p
    JOIN servicos s ON p.servico_id = s.id
    JOIN usuarios c ON p.cliente_id = c.id
    JOIN usuarios m ON p.marceneiro_id = m.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
  res.json(pedido);
});

router.post('/', (req, res) => {
  const { servico_id, cliente_id, marceneiro_id, descricao, endereco, data_agendada, valor } = req.body;
  if (!servico_id || !cliente_id || !marceneiro_id || valor == null) {
    return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
  }
  try {
    const stmt = sqlite.prepare(`
      INSERT INTO pedidos (servico_id, cliente_id, marceneiro_id, descricao, endereco, data_agendada, valor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(servico_id, cliente_id, marceneiro_id, descricao || null, endereco || null, data_agendada || null, valor);
    const newPedido = sqlite.prepare('SELECT * FROM pedidos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newPedido);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

router.patch('/:id/status', (req, res) => {
  const { status, progresso } = req.body;
  if (!status) return res.status(400).json({ error: 'Status é obrigatório' });

  try {
    sqlite.prepare('UPDATE pedidos SET status = ?, progresso = COALESCE(?, progresso) WHERE id = ?')
      .run(status, progresso, req.params.id);

    // Se concluído, incrementa projetos do marceneiro
    if (status === 'CONCLUIDO') {
      const pedido = sqlite.prepare('SELECT marceneiro_id FROM pedidos WHERE id = ?').get(req.params.id) as any;
      if (pedido) {
        sqlite.prepare('UPDATE usuarios SET total_projetos = total_projetos + 1 WHERE id = ?').run(pedido.marceneiro_id);
      }
    }

    const updated = sqlite.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

export default router;
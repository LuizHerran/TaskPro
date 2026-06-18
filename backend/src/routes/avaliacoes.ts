import { Router } from 'express';
import { sqlite } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { marceneiro_id, cliente_id, pedido_id } = req.query;
  let sql = `
    SELECT a.*, u.nome as cliente_nome
    FROM avaliacoes a
    JOIN usuarios u ON a.cliente_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (marceneiro_id) { sql += ' AND a.marceneiro_id = ?'; params.push(marceneiro_id); }
  if (cliente_id) { sql += ' AND a.cliente_id = ?'; params.push(cliente_id); }
  if (pedido_id) { sql += ' AND a.pedido_id = ?'; params.push(pedido_id); }
  sql += ' ORDER BY a.created_at DESC';

  try { res.json(sqlite.prepare(sql).all(...params)); }
  catch (err) { res.status(500).json({ error: 'Erro ao buscar avaliações' }); }
});

router.post('/', (req, res) => {
  const { pedido_id, cliente_id, marceneiro_id, nota, comentario } = req.body;
  if (!pedido_id || !cliente_id || !marceneiro_id || nota == null) {
    return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
  }
  if (nota < 1 || nota > 5) return res.status(400).json({ error: 'Nota deve ser entre 1 e 5' });

  try {
    const stmt = sqlite.prepare(`
      INSERT INTO avaliacoes (pedido_id, cliente_id, marceneiro_id, nota, comentario)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(pedido_id, cliente_id, marceneiro_id, nota, comentario || null);
    const newAval = sqlite.prepare('SELECT * FROM avaliacoes WHERE id = ?').get(info.lastInsertRowid);

    // Recalcula média do marceneiro automaticamente
    const stats = sqlite.prepare(
      'SELECT AVG(nota) as avg, COUNT(*) as count FROM avaliacoes WHERE marceneiro_id = ?'
    ).get(marceneiro_id) as any;
    sqlite.prepare('UPDATE usuarios SET avaliacao_media = ?, total_avaliacoes = ? WHERE id = ?')
      .run(parseFloat((stats.avg || 0).toFixed(1)), stats.count || 0, marceneiro_id);

    res.status(201).json(newAval);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar avaliação' });
  }
});

export default router;
import { Router } from 'express';
import { sqlite } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const cats = sqlite.prepare('SELECT * FROM categorias ORDER BY nome').all();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

export default router;
import { Router } from 'express';
import { sqlite } from '../db.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  const user = sqlite.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!user || (user as any).senha !== senha) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Remove senha da resposta por segurança
  const { senha: _, ...userSafe } = user as any;
  res.json({ user: userSafe });
});

router.post('/register', (req, res) => {
  const { nome, email, senha, tipo, telefone, bio, cidade, estado } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios ausentes' });

  try {
    const stmt = sqlite.prepare(`
      INSERT INTO usuarios (nome, email, senha, tipo, telefone, bio, cidade, estado, destaque)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    const info = stmt.run(nome, email, senha, tipo || 'CLIENTE', telefone || null, bio || null, cidade || null, estado || null);
    const newUser = sqlite.prepare('SELECT * FROM usuarios WHERE id = ?').get(info.lastInsertRowid);
    const { senha: _, ...userSafe } = newUser as any;
    res.status(201).json({ user: userSafe });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

export default router;
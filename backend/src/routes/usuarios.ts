import { Router } from 'express';
import { sqlite } from '../db.js';

const router = Router();

//READ: Listar com filtros
router.get('/', (req, res) => {
  const { tipo, categoria, q, destaque } = req.query;
  let sql = 'SELECT * FROM usuarios WHERE 1=1';
  const params: any[] = [];

  if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
  if (destaque === 'true') { sql += ' AND destaque = 1'; }
  if (categoria) {
    if (categoria) {
      sql += ` AND id IN ( SELECT marceneiro_id FROM servicos WHERE categoria_id = ? AND status = 'ATIVO')`;
      params.push(categoria);}
  }
  
  if (q) {
    const like = `%${q}%`;
    sql += ' AND (nome LIKE ? OR bio LIKE ? OR cidade LIKE ?)';
    params.push(like, like, like);
  }

  sql += ' ORDER BY avaliacao_media DESC, total_projetos DESC';

  try {
    const users = sqlite.prepare(sql).all(...params);
    res.json(users.map((u: any) => { const { senha, ...rest } = u; return rest; }));
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

//READ: Buscar por ID
router.get('/:id', (req, res) => {
  try {
    const user = sqlite.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const { senha, ...rest } = user as any;
    res.json(rest);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

//UPDATE: Atualizar dados
router.put('/:id', (req, res) => {
  const { 
    nome, 
    telefone, 
    bio, 
    cidade, 
    estado, 
    destaque,
    avatar,           
    especialidades,   
    anos_experiencia 
  } = req.body;

  console.log('📥 Recebendo atualização:', { id: req.params.id, avatar, especialidades, anos_experiencia });

  try {
    sqlite.prepare(`
      UPDATE usuarios SET 
        nome = COALESCE(?, nome), 
        telefone = COALESCE(?, telefone),
        bio = COALESCE(?, bio), 
        cidade = COALESCE(?, cidade), 
        estado = COALESCE(?, estado),
        destaque = COALESCE(?, destaque),
        avatar = COALESCE(?, avatar),
        especialidades = COALESCE(?, especialidades),
        anos_experiencia = COALESCE(?, anos_experiencia)
      WHERE id = ?
    `).run(
      nome, 
      telefone, 
      bio, 
      cidade, 
      estado, 
      destaque,
      avatar,
      especialidades,
      anos_experiencia,
      req.params.id
    );

    const updated = sqlite.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
    const { senha, ...rest } = updated as any;
    
    console.log('✅ Usuário atualizado:', rest);
    
    res.json(rest);
  } catch (err) {
    console.error('❌ Erro ao atualizar:', err);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    sqlite.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
    res.json({ message: 'Conta removida com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir' });
  }
});

export default router;
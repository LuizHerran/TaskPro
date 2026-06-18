import express from 'express';
import cors from 'cors';
import { initDB } from './initDB.js';
import { runSeed } from './seed.js';

import authRouter from './routes/auth.js';
import usuariosRouter from './routes/usuarios.js';
import categoriasRouter from './routes/categorias.js';
import servicosRouter from './routes/servicos.js';
import pedidosRouter from './routes/pedidos.js';
import avaliacoesRouter from './routes/avaliacoes.js';
import { mensagensRouter } from './routes/mensagens.js';
import { favoritosRouter } from './routes/favoritos.js';
import { agendaRouter } from './routes/agenda.js';
import { pagamentosRouter } from './routes/pagamentos.js';
import { uploadRouter } from './routes/upload.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Caminho absoluto para a pasta uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(uploadDir));

initDB();
runSeed();

app.use('/api/auth', authRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/servicos', servicosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/avaliacoes', avaliacoesRouter);
app.use('/api/mensagens', mensagensRouter);
app.use('/api/favoritos', favoritosRouter);
app.use('/api/agenda', agendaRouter);
app.use('/api/pagamentos', pagamentosRouter);
app.use('/api/upload', uploadRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.listen(PORT, () => {
  console.log(`✅ TaskPro API: http://localhost:${PORT}`);
  console.log(`📁 Pasta uploads: ${uploadDir}`);
});
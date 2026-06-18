import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const uploadRouter = Router();

// ✅ Caminho absoluto para a pasta uploads (na raiz do backend)
const uploadDir = path.resolve(process.cwd(), 'uploads');

// Criar pasta se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Pasta uploads criada em:', uploadDir);
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Rota de upload
uploadRouter.post('/avatar', upload.single('avatar'), (req, res) => {
  try {
    console.log(' Recebendo upload...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    console.log('✅ Upload concluído:', fileUrl);
    console.log('📁 Salvo em:', path.join(uploadDir, req.file.filename));

    res.json({ 
      url: fileUrl,
      avatar: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});
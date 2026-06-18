import { sqlite } from './db.js';

export function initDB() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      nome             TEXT    NOT NULL,
      email            TEXT    NOT NULL UNIQUE,
      senha            TEXT    NOT NULL,
      tipo             TEXT    NOT NULL DEFAULT 'CLIENTE' CHECK(tipo IN ('CLIENTE','MARCENEIRO')),
      telefone         TEXT,
      bio              TEXT,
      cidade           TEXT,
      estado           TEXT,
      destaque         INTEGER DEFAULT 0,
      avaliacao_media  REAL    DEFAULT 0,
      total_projetos   INTEGER DEFAULT 0,
      total_avaliacoes INTEGER DEFAULT 0,
      avatar           TEXT,
      especialidades   TEXT,             
      anos_experiencia INTEGER DEFAULT 0, 
      created_at       TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      descricao TEXT,
      icone     TEXT
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo          TEXT    NOT NULL,
      descricao       TEXT    NOT NULL,
      preco_base      REAL    NOT NULL,
      marceneiro_id   INTEGER NOT NULL REFERENCES usuarios(id),
      categoria_id    INTEGER NOT NULL REFERENCES categorias(id),
      status          TEXT    NOT NULL DEFAULT 'ATIVO' CHECK(status IN ('ATIVO','INATIVO')),
      tempo_estimado  TEXT,
      imagem_url      TEXT,
      avaliacao_media REAL    DEFAULT 0,
      total_avaliacoes INTEGER DEFAULT 0, 
      created_at      TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      servico_id    INTEGER NOT NULL REFERENCES servicos(id),
      cliente_id    INTEGER NOT NULL REFERENCES usuarios(id),
      marceneiro_id INTEGER NOT NULL REFERENCES usuarios(id),
      status        TEXT    NOT NULL DEFAULT 'PENDENTE'
                    CHECK(status IN ('PENDENTE','ACEITO','EM_ANDAMENTO','CONCLUIDO','CANCELADO')),
      descricao     TEXT,
      endereco      TEXT,
      data_agendada TEXT,
      valor         REAL    NOT NULL,
      progresso     INTEGER DEFAULT 0,
      pagamento_id  TEXT,
      pagamento_status TEXT DEFAULT 'PENDENTE',
      created_at    TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS avaliacoes (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id     INTEGER NOT NULL REFERENCES pedidos(id),
      cliente_id    INTEGER NOT NULL REFERENCES usuarios(id),
      marceneiro_id INTEGER NOT NULL REFERENCES usuarios(id),
      nota          INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
      comentario    TEXT,
      created_at    TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mensagens (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      remetente_id     INTEGER NOT NULL REFERENCES usuarios(id),
      destinatario_id  INTEGER NOT NULL REFERENCES usuarios(id),
      pedido_id        INTEGER REFERENCES pedidos(id),
      conteudo         TEXT    NOT NULL,
      lida             INTEGER DEFAULT 0,
      created_at       TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favoritos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id    INTEGER NOT NULL REFERENCES usuarios(id),
      marceneiro_id INTEGER NOT NULL REFERENCES usuarios(id),
      created_at    TEXT    DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(cliente_id, marceneiro_id)
    );

    CREATE TABLE IF NOT EXISTS agenda (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      marceneiro_id INTEGER NOT NULL REFERENCES usuarios(id),
      data          TEXT    NOT NULL,
      hora_inicio   TEXT    NOT NULL,
      hora_fim      TEXT    NOT NULL,
      disponivel    INTEGER DEFAULT 1,
      pedido_id     INTEGER REFERENCES pedidos(id),
      observacao    TEXT,
      created_at    TEXT    DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ✅ Adicionar colunas faltantes se não existirem
  try {
    sqlite.exec(`ALTER TABLE usuarios ADD COLUMN especialidades TEXT`);
    console.log('✅ Coluna especialidades adicionada');
  } catch (e) {
    // Coluna já existe, ignora
  }

  try {
    sqlite.exec(`ALTER TABLE usuarios ADD COLUMN anos_experiencia INTEGER DEFAULT 0`);
    console.log('✅ Coluna anos_experiencia adicionada');
  } catch (e) {
    // Coluna já existe, ignora
  }

  try {
    sqlite.exec(`ALTER TABLE servicos ADD COLUMN total_avaliacoes INTEGER DEFAULT 0`);
    console.log('✅ Coluna total_avaliacoes adicionada em servicos');
  } catch (e) {
    // Coluna já existe, ignora
  }
}
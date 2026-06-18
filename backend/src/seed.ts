import { sqlite } from './db.js';

export function runSeed() {
  try {
    // Verifica se já existem dados para não duplicar
    const count = sqlite.prepare('SELECT COUNT(*) as c FROM usuarios').get() as { c: number };
    if (count.c > 0) {
      console.log('📦 Banco já possui dados. Seed ignorado.');
      return;
    }

    console.log('🌱 Executando seed...');
    
    sqlite.exec(`
      INSERT INTO usuarios (nome, email, senha, tipo, telefone, bio, cidade, estado, destaque, especialidades, anos_experiencia) 
      VALUES 
        ('Roberto Nogueira', 'roberto@taskpro.com', '123456', 'CLIENTE', '(61) 4002-8022', 'Cliente interessado em móveis planejados', 'Brasília', 'DF', 0, NULL, 0),
        ('João Marceneiro', 'joao@email.com', '123456', 'MARCENEIRO', '(61) 98888-2222', 'Especialista em móveis sob medida com foco em projetos residenciais', 'Goiânia', 'GO', 1, 'Roupeiros, painel TV, Restauração', 8)
    `);

    sqlite.exec(`
      INSERT INTO categorias (nome, descricao, icone) 
      VALUES 
        ('Cozinha', 'Móveis planejados para cozinha', '🍳'),
        ('Quarto', 'Armários e closets', '🛏️'),
        ('Sala', 'Racks, painéis e estantes', '🛋️'),
        ('Escritório', 'Móveis para home office', '💼'),
        ('Banheiro', 'Gabinetes e nichos', '🚿')
    `);

    sqlite.exec(`
      INSERT INTO servicos (titulo, descricao, preco_base, marceneiro_id, categoria_id, tempo_estimado) 
      VALUES 
        ('Montagem de móveis', 'Montagem profissional de móveis residenciais', 150.00, 2, 1, '2 dias'),
        ('Restauração de mesa', 'Restauração completa de mesas antigas', 300.00, 2, 2, '5 dias'),
        ('Armário sob medida', 'Projeto e execução de armários personalizados', 1200.00, 2, 2, '15 dias'),
        ('Rack para TV', 'Rack moderno com acabamento em MDF', 450.00, 2, 3, '7 dias')
    `);

    sqlite.exec(`
      INSERT INTO pedidos (servico_id, cliente_id, marceneiro_id, status, descricao, endereco, data_agendada, valor, progresso) 
      VALUES 
        (1, 1, 2, 'EM_ANDAMENTO', 'Montagem de guarda-roupa', 'Rua A, Brasília - DF', '2026-06-10', 150.00, 50)
    `);

    sqlite.exec(`
      INSERT INTO avaliacoes (pedido_id, cliente_id, marceneiro_id, nota, comentario) 
      VALUES 
        (1, 1, 2, 5, 'Excelente serviço e muito profissional!')
    `);

    // Atualiza estatísticas do marceneiro
    sqlite.exec(`
      UPDATE usuarios 
      SET avaliacao_media = 5.0, total_projetos = 1, total_avaliacoes = 1
      WHERE id = 2
    `);

    console.log('✅ Seed executado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir seeds:', error);
  }
}
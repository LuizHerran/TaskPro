export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'CLIENTE' | 'MARCENEIRO';
  telefone?: string;
  bio?: string;
  avatar_url?: string;
  cidade?: string;
  estado?: string;
  avaliacao_media: number;
  total_avaliacoes: number;
  total_projetos: number;
  destaque: number;
  avatar?: string;
  created_at: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
}

export interface Servico {
  id: number;
  titulo: string;
  descricao: string;
  preco_base: number;
  marceneiro_id: number;
  categoria_id: number;
  status: 'ATIVO' | 'INATIVO';
  imagem_url?: string;
  tempo_estimado?: string;
  avaliacao_media: number;
  total_avaliacoes: number;
  created_at: string;
  marceneiro_nome?: string;
  marceneiro_cidade?: string;
  marceneiro_estado?: string;
  marceneiro_avaliacao?: number;
  marceneiro_projetos?: number;
  marceneiro_bio?: string;
  destaque?: number;
  categoria_nome?: string;
}

export interface Pedido {
  id: number;
  servico_id: number;
  cliente_id: number;
  marceneiro_id: number;
  status: 'PENDENTE' | 'ACEITO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  descricao?: string;
  endereco?: string;
  data_agendada?: string;
  valor: number;
  progresso: number;
  created_at: string;
  servico_titulo?: string;
  cliente_nome?: string;
  marceneiro_nome?: string;
}

export interface Avaliacao {
  id: number;
  pedido_id: number;
  cliente_id: number;
  marceneiro_id: number;
  nota: number;
  comentario?: string;
  created_at: string;
  cliente_nome?: string;
  marceneiro_nome?: string;
}

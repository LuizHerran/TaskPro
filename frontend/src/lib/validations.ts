import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const cadastroSchema = z.object({
  nome:     z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email:    z.string().email('Email inválido'),
  senha:    z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmar:z.string(),
  tipo:     z.enum(['CLIENTE', 'MARCENEIRO']),
  telefone: z.string().optional(),
  cidade:   z.string().min(2, 'Informe a cidade').optional(),
  estado:   z.string().length(2, 'Use a sigla do estado (ex: SP)').optional(),
}).refine(d => d.senha === d.confirmar, {
  message: 'As senhas não coincidem',
  path: ['confirmar'],
});

export const perfilSchema = z.object({
  nome:     z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: z.string().optional(),
  bio:      z.string().max(500, 'Bio pode ter no máximo 500 caracteres').optional(),
  cidade:   z.string().min(2, 'Informe a cidade'),
  estado:   z.string().length(2, 'Use a sigla (ex: SP)'),
});

export const anuncioSchema = z.object({
  titulo:         z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  descricao:      z.string().min(10, 'Descreva melhor o serviço'),
  preco_base:     z.number().positive('Valor deve ser positivo'),
  categoria_id:   z.number().min(1, 'Escolha uma categoria'),
  tempo_estimado: z.string().optional(),
});

export const contratarSchema = z.object({
  descricao:    z.string().min(10, 'Descreva melhor o que precisa'),
  endereco:     z.string().min(5, 'Informe o endereço completo'),
  data_agendada:z.string().min(1, 'Escolha uma data'),
});

export const agendaSchema = z.object({
  data:        z.string().min(1, 'Escolha uma data'),
  hora_inicio: z.string().min(1, 'Informe o horário de início'),
  hora_fim:    z.string().min(1, 'Informe o horário de fim'),
  observacao:  z.string().optional(),
});

export type LoginForm     = z.infer<typeof loginSchema>;
export type CadastroForm  = z.infer<typeof cadastroSchema>;
export type PerfilForm    = z.infer<typeof perfilSchema>;
export type AnuncioForm   = z.infer<typeof anuncioSchema>;
export type ContratarForm = z.infer<typeof contratarSchema>;
export type AgendaForm    = z.infer<typeof agendaSchema>;

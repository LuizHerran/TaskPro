import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const authApi = {
  login:   (email: string, senha: string) =>
    api.post('/auth/login', { email, senha }).then(r => r.data),
  cadastro: (data: object) =>
    api.post('/auth/register', data).then(r => r.data),
};
// aqui são ações relacionadas à autenticação, como login e cadastro. O login retorna um token JWT que deve ser armazenado no 
// localStorage para autenticação em chamadas futuras.
export const usuariosApi = {
  listar:   (params?: object) => api.get('/usuarios', { params }).then(r => r.data),
  buscar:   (id: number)      => api.get(`/usuarios/${id}`).then(r => r.data),
  atualizar:(id: number, data: object) => api.put(`/usuarios/${id}`, data).then(r => r.data),
  deletar:  (id: number)      => api.delete(`/usuarios/${id}`).then(r => r.data), 
};

export const categoriasApi = {
  listar: () => api.get('/categorias').then(r => r.data),
};

export const servicosApi = {
  listar:   (params?: object) => api.get('/servicos', { params }).then(r => r.data),
  buscar:   (id: number)      => api.get(`/servicos/${id}`).then(r => r.data),
  criar:    (data: object)    => api.post('/servicos', data).then(r => r.data),
  atualizar:(id: number, data: object) => api.put(`/servicos/${id}`, data).then(r => r.data),
  deletar:  (id: number)      => api.delete(`/servicos/${id}`).then(r => r.data),
};

export const pedidosApi = {
  listar:         (params?: object) => api.get('/pedidos', { params }).then(r => r.data),
  buscar:         (id: number)      => api.get(`/pedidos/${id}`).then(r => r.data),
  criar:          (data: object)    => api.post('/pedidos', data).then(r => r.data),
  atualizarStatus:(id: number, status: string, progresso: number) =>
    api.patch(`/pedidos/${id}/status`, { status, progresso }).then(r => r.data),
};

export const avaliacoesApi = {
  listar: (params?: object) => api.get('/avaliacoes', { params }).then(r => r.data),
  criar:  (data: object)    => api.post('/avaliacoes', data).then(r => r.data),
};


//novo
export default api;



export const mensagensApi = {
  listarConversa: (user1: number, user2: number) =>
    api.get(`/mensagens/conversa/${user1}/${user2}`).then(r => r.data),
  enviar: (data: {
    remetente_id: number;
    destinatario_id: number;
    conteudo: string;
    pedido_id?: number | null;
  }) => api.post('/mensagens', data).then(r => r.data),
};

export const favoritosApi = {
  listar:   (cliente_id: number)                          => api.get('/favoritos', { params: { cliente_id } }).then(r => r.data),
  checar:   (cliente_id: number, marceneiro_id: number)   => api.get('/favoritos/check', { params: { cliente_id, marceneiro_id } }).then(r => r.data),
  adicionar:(cliente_id: number, marceneiro_id: number)   => api.post('/favoritos', { cliente_id, marceneiro_id }).then(r => r.data),
  remover:  (cliente_id: number, marceneiro_id: number)   => api.delete('/favoritos', { params: { cliente_id, marceneiro_id } }).then(r => r.data),
};

export const agendaApi = {
  listar: (marceneiro_id: number, data?: string) => api.get('/agenda', { params: { marceneiro_id, data } }).then(r => r.data),
  criar:  (d: object)                            => api.post('/agenda', d).then(r => r.data),
  atualizar:(id: number, d: object)              => api.put(`/agenda/${id}`, d).then(r => r.data),
  deletar:  (id: number)                         => api.delete(`/agenda/${id}`).then(r => r.data),
};

export const pagamentosApi = {
  gerarPix: (d: object) => api.post('/pagamentos/pix', d).then(r => r.data),
  status:   (pedido_id: number) => api.get(`/pagamentos/status/${pedido_id}`).then(r => r.data),
};
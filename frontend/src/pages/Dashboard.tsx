import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { avaliacoesApi, pedidosApi } from '../api/client';
import { getAvatarUrl } from '../utils/imageUrl';
import type { Pedido } from '../types';

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  ACEITO: 'Aceito',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  PENDENTE: { icon: '⏳', color: '#92400e', bg: '#fef3c7' },
  ACEITO: { icon: '✅', color: '#166534', bg: '#dcfce7' },
  EM_ANDAMENTO: { icon: '🔨', color: '#1e40af', bg: '#dbeafe' },
  CONCLUIDO: { icon: '🎉', color: '#166534', bg: '#dcfce7' },
  CANCELADO: { icon: '❌', color: '#991b1b', bg: '#fee2e2' },
};

function getStoredUser() {
  try {
    const raw = localStorage.getItem('taskpro_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('taskpro_user');
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [pedidoAvaliacao, setPedidoAvaliacao] = useState<Pedido | null>(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  function abrirModalAvaliacao(pedido: Pedido) {
  setPedidoAvaliacao(pedido);
}

function fecharModalAvaliacao() {
  setPedidoAvaliacao(null);
  setNota(5);
  setComentario('');
}

async function enviarAvaliacao() {
  if (!pedidoAvaliacao) return;

  try {
    await avaliacoesApi.criar({
      pedido_id: pedidoAvaliacao.id,
      cliente_id: pedidoAvaliacao.cliente_id,
      marceneiro_id: pedidoAvaliacao.marceneiro_id,
      nota,
      comentario,
    });

    fecharModalAvaliacao();
    setMostrarSucesso(true);
  } catch (error) {
    console.error(error);
    alert('Erro ao enviar avaliação');
  }
}

  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    setUser(currentUser);

    const param = currentUser.tipo === 'MARCENEIRO'
      ? { marceneiro_id: currentUser.id }
      : { cliente_id: currentUser.id };

    pedidosApi.listar(param)
      .then(setPedidos)
      .catch((err) => {
        console.error('Erro ao carregar pedidos:', err);
        setApiError('Não foi possível carregar seus pedidos.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('taskpro_user');
    navigate('/login');
  }

  async function alterarStatus( id: number, novoStatus: Pedido['status'], progresso: number = 0 ) {
  try { await pedidosApi.atualizarStatus(id, novoStatus, progresso);

    setPedidos(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: novoStatus,
              progresso
            }
          : p
      )
    );
  } catch (error) {
    console.error('Erro ao alterar status:', error);
  }
}
  if (!user) return null;

  const total = pedidos.length;
  const concluidos = pedidos.filter(p => p.status === 'CONCLUIDO').length;
  const andamento = pedidos.filter(p => p.status === 'EM_ANDAMENTO').length;
  const pendentes = pedidos.filter(p => p.status === 'PENDENTE').length;

  const pedidosFiltrados = filtroStatus === 'TODOS' 
    ? pedidos 
    : pedidos.filter(p => p.status === filtroStatus);

  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    const dateA = a.data_agendada ? new Date(a.data_agendada).getTime() : 0;
    const dateB = b.data_agendada ? new Date(b.data_agendada).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <main className="dashboard" style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div className="dashboard__inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Header com informações do usuário */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 32,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Avatar */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                {user.avatar ? (
                  <img 
                    src={getAvatarUrl(user.avatar)} 
                    alt={user.nome} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  user.tipo === 'MARCENEIRO' ? '👷' : '👤'
                )}
              </div>
              
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
                  Olá, {user.nome.split(' ')[0]}! 👋
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: 14, opacity: 0.95, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {user.tipo === 'MARCENEIRO' ? '👷 Marceneiro' : '👤 Cliente'}
                  </span>
                  {user.cidade && (
                    <span>📍 {user.cidade}{user.estado ? `, ${user.estado}` : ''}</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
              }}
            >
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}>
                📦
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brown)', fontFamily: 'var(--font-heading)' }}>
              {total}
            </div>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}>
                ⏳
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pendentes
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#92400e', fontFamily: 'var(--font-heading)' }}>
              {pendentes}
            </div>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}>
                🔨
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Em Andamento
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#1e40af', fontFamily: 'var(--font-heading)' }}>
              {andamento}
            </div>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}>
                ✅
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Concluídos
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#166534', fontFamily: 'var(--font-heading)' }}>
              {concluidos}
            </div>
          </div>
        </div>

        {/* Título da seção */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--brown)',
            fontFamily: 'var(--font-heading)',
          }}>
            {user.tipo === 'MARCENEIRO' ? '📋 Pedidos Recebidos' : '📦 Meus Pedidos'}
          </h2>

          {pedidos.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['TODOS', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'].map(status => (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '2px solid',
                    background: filtroStatus === status ? 'var(--brown)' : '#fff',
                    color: filtroStatus === status ? '#fff' : 'var(--brown)',
                    borderColor: 'var(--brown)',
                    transition: 'all 0.2s',
                  }}
                >
                  {status === 'TODOS' ? 'Todos' : STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Pedidos */}
        {loading ? (
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 60,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Carregando pedidos...</p>
          </div>
        ) : apiError ? (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '20px 24px',
            color: '#991b1b',
            fontSize: 14,
            fontWeight: 500,
          }}>
            ⚠️ {apiError}
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{
            background: '#fff',
            border: '2px dashed var(--border)',
            borderRadius: 12,
            padding: 60,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📭</div>
            <h3 style={{
              color: 'var(--brown)',
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
              margin: '0 0 8px 0',
            }}>
              Nenhum pedido encontrado
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: 14,
              marginBottom: 24,
              maxWidth: 400,
              margin: '0 auto 24px',
            }}>
              {user.tipo === 'CLIENTE' 
                ? 'Você ainda não fez nenhum pedido. Encontre um marceneiro e comece agora!'
                : 'Você ainda não recebeu nenhum pedido. Divulgue seus serviços para atrair clientes!'}
            </p>
            {user.tipo === 'CLIENTE' && (
              <Link
                to="/marceneiros"
                className="btn-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                🔍 Encontrar Marceneiro
              </Link>
            )}
          </div>
        ) : pedidosOrdenados.length === 0 ? (
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Nenhum pedido com este filtro.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pedidosOrdenados.map(p => {
              const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDENTE;
              
              return (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--brown)',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {p.servico_titulo}
                      </h3>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        marginBottom: 12,
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          👤 {user.tipo === 'MARCENEIRO' ? p.cliente_nome : p.marceneiro_nome}
                        </span>
                        {p.data_agendada && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            📅 {new Date(p.data_agendada).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>

                      {p.descricao && (
                        <p style={{
                          margin: '0 0 12px 0',
                          fontSize: 13,
                          color: 'var(--text-mid)',
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {p.descricao}
                        </p>
                      )}

                      
                    

                      {p.status === 'EM_ANDAMENTO' && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                            fontSize: 12,
                            fontWeight: 600,
                          }}>
                            <span style={{ color: 'var(--text-muted)' }}>Progresso</span>
                            <span style={{ color: '#1e40af' }}>{p.progresso ?? 0}%</span>
                          </div>
                          <div style={{
                            width: '100%',
                            maxWidth: 300,
                            height: 8,
                            background: '#e5e7eb',
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${p.progresso ?? 0}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)',
                              borderRadius: 999,
                              transition: 'width 0.3s',
                            }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: 'var(--brown)',
                        fontFamily: 'var(--font-heading)',
                        marginBottom: 8,
                      }}>
                        R$ {(p.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: statusConfig.bg,
                        color: statusConfig.color,
                      }}>
                        {statusConfig.icon} {STATUS_LABELS[p.status]}
                      </span>

                      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>

                        {user.tipo === 'MARCENEIRO' && p.status === 'PENDENTE' && (
                          <button
                            onClick={() => alterarStatus(p.id, 'ACEITO')}
                            style={{
                              padding: '6px 12px',
                              fontSize: 12,
                              fontWeight: 600,
                              background: '#dbeafe',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              borderRadius: 6,
                              cursor: 'pointer',
                            }}
                          >
                            ✓ Aceitar
                          </button>
                        )}

                        {user.tipo === 'MARCENEIRO' && p.status === 'ACEITO' && (
                          <>
                            <button
                              onClick={() => alterarStatus(p.id, 'EM_ANDAMENTO', 10)}
                              style={{
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                background: '#dbeafe',
                                color: '#1e40af',
                                border: '1px solid #bfdbfe',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              🔨 Iniciar
                            </button>

                            <button
                              onClick={() => alterarStatus(p.id, 'CANCELADO')}
                              style={{
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                background: '#fee2e2',
                                color: '#991b1b',
                                border: '1px solid #fecaca',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              ❌ Cancelar
                            </button>
                          </>
                        )}

                        {p.status === 'EM_ANDAMENTO' && user.tipo === 'MARCENEIRO' && (
                          <>
                            <button
                              onClick={() => alterarStatus(p.id, 'EM_ANDAMENTO', 25)}
                            >
                              25%
                            </button>

                            <button
                              onClick={() => alterarStatus(p.id, 'EM_ANDAMENTO', 50)}
                            >
                              50%
                            </button>

                            <button
                              onClick={() => alterarStatus(p.id, 'EM_ANDAMENTO', 75)}
                            >
                              75%
                            </button>


                            <button
                              onClick={() => alterarStatus(p.id, 'CONCLUIDO', 100)}
                              style={{
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                background: '#dcfce7',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              ✅ Concluir
                            </button>

                            <button
                              onClick={() => alterarStatus(p.id, 'CANCELADO')}
                              style={{
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                background: '#fee2e2',
                                color: '#991b1b',
                                border: '1px solid #fecaca',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              ❌ Cancelar
                            </button>
                          </>
                        )}

                        {p.status === 'CONCLUIDO' && user.tipo === 'CLIENTE' && (
                            <button
                              onClick={() => abrirModalAvaliacao(p)}
                              style={{
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                background: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #fde68a',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              ⭐ Avaliar Serviço
                            </button>
                          )}
                        
                        <Link
                          to={`/chat/${user.tipo === 'MARCENEIRO' ? p.cliente_id : p.marceneiro_id}`}
                          style={{
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#fff',
                            color: 'var(--brown)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          💬 Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ações rápidas */}
        <div style={{
          marginTop: 48,
          padding: '24px',
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--brown)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            ⚡ Ações Rápidas
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/marceneiros"
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {user.tipo === 'MARCENEIRO' ? '👤 Ver Meu Perfil Público' : '🔍 Buscar Marceneiro'}
            </Link>

            <Link to="/favoritos" style={{
                padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '2px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
              }}>
                ❤️ Favoritos
              </Link>

            <Link
              to="/perfil"
              className="btn-ghost"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                border: '2px solid var(--border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ⚙️ Editar Perfil
            </Link>
            {user.tipo === 'MARCENEIRO' && (
              <Link
                to="/agenda"
                className="btn-ghost"
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '2px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                📅 Minha Agenda
              </Link>
            )}
            <Link
              to="/"
              className="btn-ghost"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                border: '2px solid var(--border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🏠 Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    
      {pedidoAvaliacao && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: '#fff',
        padding: 24,
        borderRadius: 12,
        width: '90%',
        maxWidth: 500,
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        ⭐ Avaliar Serviço
      </h2>

      <p>
        Como foi sua experiência com {pedidoAvaliacao.marceneiro_nome}?
      </p>

      <div style={{ marginBottom: 16 }}>
        <label>Nota:</label>

        <select
          value={nota}
          onChange={(e) => setNota(Number(e.target.value))}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 6,
          }}
        >
          <option value={1}>⭐ 1</option>
          <option value={2}>⭐⭐ 2</option>
          <option value={3}>⭐⭐⭐ 3</option>
          <option value={4}>⭐⭐⭐⭐ 4</option>
          <option value={5}>⭐⭐⭐⭐⭐ 5</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Comentário:</label>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            marginTop: 6,
            padding: 10,
            resize: 'vertical',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <button onClick={fecharModalAvaliacao}>
          Cancelar
        </button>

        <button onClick={enviarAvaliacao}>
          Enviar Avaliação
        </button>
      </div>
    </div>
  </div>
)}

  {mostrarSucesso && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}
  >
    <div
      style={{
        background: '#fff',
        padding: 30,
        borderRadius: 16,
        width: '90%',
        maxWidth: 420,
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          fontSize: 60,
          marginBottom: 16,
        }}
      >
        🎉
      </div>

      <h2
        style={{
          margin: '0 0 10px',
          color: '#166534',
        }}
      >
        Avaliação enviada!
      </h2>

      <p
        style={{
          color: '#6b7280',
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        Obrigado pelo feedback. Sua avaliação ajuda outros clientes a encontrarem profissionais de confiança.
      </p>

      <button
        onClick={() => setMostrarSucesso(false)}
        style={{
          padding: '10px 24px',
          background: 'var(--brown)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Fechar
      </button>
    </div>
  </div>
)}

    </main>
  );
}
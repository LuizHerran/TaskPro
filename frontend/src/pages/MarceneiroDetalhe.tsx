import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { usuariosApi, servicosApi, avaliacoesApi, favoritosApi } from '../api/client';
import { getAvatarUrl } from '../utils/imageUrl';
import type { Usuario, Servico, Avaliacao } from '../types';

const AVATARES = [
  'https://i.pinimg.com/736x/d6/22/62/d622626725e83cdcbd5abe77e4d1f44b.jpg',
];

export default function MarceneiroDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [marc, setMarc] = useState<Usuario | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [avs, setAvs] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [favoritando, setFavoritando] = useState(false);
  const userRaw = localStorage.getItem('taskpro_user');
  const userLogado = userRaw ? JSON.parse(userRaw) : null;

  const safeId = Number(id);
  const idx = (!isNaN(safeId) && safeId > 0) ? Math.abs(safeId) % AVATARES.length : 0;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([
      usuariosApi.buscar(Number(id)),
      servicosApi.listar({ marceneiro_id: id }),
      avaliacoesApi.listar({ marceneiro_id: id }),
    ])
      .then(([u, s, a]) => {
        setMarc(u);
        setServicos(s);
        setAvs(a);
      })
      .catch((err) => {
        console.error('Erro ao carregar perfil:', err);
        setError('Não foi possível carregar os dados do marceneiro.');
      })
      .finally(() => setLoading(false));

    if (userLogado && userLogado.tipo === 'CLIENTE') {
      favoritosApi.checar(userLogado.id, Number(id))
        .then((r: { favorito: boolean }) => setFavorito(r.favorito))
        .catch(() => {});
    }
  }, [id]);

  async function handleFavoritar() {
    if (!marc || !userLogado || favoritando) return;
    
    setFavoritando(true);
    try {
      if (favorito) {
        await favoritosApi.remover(userLogado.id, marc.id);
        setFavorito(false);
      } else {
        await favoritosApi.adicionar(userLogado.id, marc.id);
        setFavorito(true);
      }
    } catch (err) {
      console.error('Erro ao favoritar:', err);
    } finally {
      setFavoritando(false);
    }
  }

  function handleContatar() {
    const userRaw = localStorage.getItem('taskpro_user');

    if (!userRaw) {
      navigate('/login', {
        state: { from: location.pathname }
      });
      return;
    }

    if (!marc) return;

    navigate(`/chat/${marc.id}`);
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Carregando perfil do marceneiro...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
        <h2 style={{ color: 'var(--brown)', marginBottom: 12 }}>Erro ao Carregar</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
        <Link to="/marceneiros" className="btn-primary">Voltar para Marceneiros</Link>
      </div>
    );
  }

  if (!marc) {
    return (
      <div style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
        <h2 style={{ color: 'var(--brown)', marginBottom: 12 }}>Marceneiro não encontrado</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>O perfil que você procura não existe ou foi removido.</p>
        <Link to="/marceneiros" className="btn-primary">Explorar Outros Marceneiros</Link>
      </div>
    );
  }

  return (
    <main className="page" style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div className="page__inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Breadcrumb */}
        <Link
          to="/marceneiros"
          style={{
            color: 'var(--brown-light)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
          }}
        >
          ← Voltar para Marceneiros
        </Link>

        {/* Header do Perfil */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
          borderRadius: 20,
          padding: '40px',
          marginBottom: 32,
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Pattern decorativo */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 40,
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Avatar e Info Básica */}
            <div style={{ textAlign: 'center' }}>
              {/* Avatar */}iação
              <div style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 20px',
                border: '6px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                background: '#d4c4bc',
              }}>
                <img
                  src={marc.avatar ? getAvatarUrl(marc.avatar) : AVATARES[idx]}
                  alt={marc.nome}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Badge de Destaque */}
              {marc.destaque && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 16,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                  ⭐ Marceneiro Destaque
                </div>
              )}

              {/* Avaliação */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 18,
                  fontWeight: 700,
                }}>
                  ⭐ {(marc.avaliacao_media ?? 0).toFixed(1)}
                </div>
                <span style={{ fontSize: 14, opacity: 0.9 }}>
                  ({marc.total_avaliacoes ?? 0} avaliações)
                </span>
              </div>

              {/* Localização */}
              <div style={{
                fontSize: 14,
                opacity: 0.95,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                📍 {marc.cidade}, {marc.estado}
              </div>

              {/* Projetos */}
              <div style={{
                fontSize: 14,
                opacity: 0.95,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                🔨 {marc.total_projetos} projetos realizados
              </div>
            </div>

            {/* Nome e Ações */}
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: 36,
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
              }}>
                {marc.nome}
              </h1>
              <p style={{
                margin: '0 0 24px 0',
                fontSize: 16,
                opacity: 0.95,
              }}>
                Marceneiro Profissional
              </p>

              {/* Bio */}
              {marc.bio && (
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  opacity: 0.95,
                  marginBottom: 32,
                  maxWidth: 600,
                }}>
                  {marc.bio}
                </p>
              )}

              {/* Botões de Ação */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {userLogado?.tipo === 'CLIENTE' && (
                  <button
                    onClick={handleFavoritar}
                    disabled={favoritando}
                    style={{
                      padding: '12px 24px',
                      background: favorito ? '#fee2e2' : 'rgba(255,255,255,0.15)',
                      color: favorito ? '#b91c1c' : '#fff',
                      border: favorito ? '2px solid #fca5a5' : '2px solid rgba(255,255,255,0.3)',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: favoritando ? 'not-allowed' : 'pointer',
                      opacity: favoritando ? 0.7 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {favoritando ? '⏳' : favorito ? '❤️' : '🤍'}
                    {favorito ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}
                  </button>
                )}
                
                <button
                  onClick={handleContatar}
                  style={{
                    padding: '12px 24px',
                    background: '#fff',
                    color: 'var(--brown)',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  💬 Entrar em Contato
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Serviços Oferecidos */}
          {servicos.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'var(--brown-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}>
                  🛠️
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--brown)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    Serviços Oferecidos
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    {servicos.length} {servicos.length === 1 ? 'serviço disponível' : 'serviços disponíveis'}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}>
                {servicos.map(s => (
                  <div
                    key={s.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Título e Categoria */}
                    <div>
                      <h3 style={{
                        margin: '0 0 6px 0',
                        fontSize: 17,
                        fontWeight: 700,
                        color: 'var(--brown)',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {s.titulo}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: 'var(--text-muted)',
                      }}>
                        <span style={{
                          background: '#eff6ff',
                          color: '#1e40af',
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontWeight: 600,
                        }}>
                          {s.categoria_nome}
                        </span>
                        <span>⏱️ {s.tempo_estimado}</span>
                      </div>
                    </div>

                    

                    {/* Preço */}
                    <div style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: 'var(--brown)',
                      fontFamily: 'var(--font-heading)',
                    }}>
                      R$ {s.preco_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    {/* Botão Contratar */}
                    <Link
                      to={`/contratar/${s.id}`}
                      className="btn-primary"
                      style={{
                        padding: '12px 20px',
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 'auto',
                      }}
                    >
                      💼 Contratar este serviço
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avaliações dos Clientes */}
          {avs.length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}>
                  ⭐
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--brown)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    Avaliações dos Clientes
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    {avs.length} {avs.length === 1 ? 'avaliação' : 'avaliações'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {avs.map(a => (
                  <div
                    key={a.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Header da Avaliação */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      flexWrap: 'wrap',
                      gap: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Avatar do Cliente */}
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 18,
                          fontWeight: 700,
                        }}>
                          {(a.cliente_nome || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: 'var(--text-dark)',
                          }}>
                            {a.cliente_nome}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: 'var(--text-muted)',
                          }}>
                            Cliente verificado ✓
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          color: '#fbbf24',
                          fontSize: 18,
                          marginBottom: 4,
                        }}>
                          {'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: 'var(--text-faint)',
                        }}>
                          {new Date(a.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Comentário */}
                    {a.comentario && (
                      <p style={{
                        fontSize: 14,
                        color: 'var(--text-mid)',
                        lineHeight: 1.7,
                        margin: 0,
                        fontStyle: 'italic',
                        paddingLeft: 56,
                      }}>
                        "{a.comentario}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State para Serviços */}
          {servicos.length === 0 && (
            <div style={{
              background: '#fff',
              border: '2px dashed var(--border)',
              borderRadius: 16,
              padding: '60px 40px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🛠️</div>
              <h3 style={{
                color: 'var(--brown)',
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
              }}>
                Nenhum serviço cadastrado
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: 14,
              }}>
                Este marceneiro ainda não cadastrou serviços disponíveis.
              </p>
            </div>
          )}

          {/* Empty State para Avaliações */}
          {avs.length === 0 && servicos.length > 0 && (
            <div style={{
              background: '#fff',
              border: '2px dashed var(--border)',
              borderRadius: 16,
              padding: '60px 40px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>⭐</div>
              <h3 style={{
                color: 'var(--brown)',
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
              }}>
                Nenhuma avaliação ainda
              </h3>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: 14,
              }}>
                Seja o primeiro a contratar e avaliar este marceneiro!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usuariosApi, categoriasApi } from '../api/client';
import { getAvatarUrl } from '../utils/imageUrl';
import type { Usuario, Categoria } from '../types';

const AVATARES = [
  'https://i.pinimg.com/736x/d6/22/62/d622626725e83cdcbd5abe77e4d1f44b.jpg',
  'https://www.svgrepo.com/show/452030/avatar-default.svg',
  'https://static.vecteezy.com/ti/vetor-gratis/p1/26641311-martelo-e-serra-silhueta-marceneiro-ferramenta-icone-marcenaria-simbolo-vetor.jpg',
  ''
];

export default function Marceneiros() {
  const [marceneiros, setMarceneiros] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState('');

  const catFiltro = searchParams.get('categoria') ?? '';
  const qFiltro = searchParams.get('q') ?? '';

  useEffect(() => {
    setLoading(true);
    setApiError('');
    
    const paramsApi: Record<string, string> = { tipo: 'MARCENEIRO' };
    if (catFiltro) paramsApi.categoria = catFiltro;
    if (qFiltro) paramsApi.q = qFiltro;

    Promise.all([
      usuariosApi.listar(paramsApi),
      categoriasApi.listar(),
    ])
      .then(([users, cats]) => {
        setMarceneiros(users);
        setCategorias(cats);
      })
      .catch((err) => {
        console.error('Erro ao carregar marceneiros ou categorias:', err);
        setApiError('Não foi possível carregar a lista de profissionais. Tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [catFiltro, qFiltro]);

  const filtrados = useMemo(() => {
    if (!qFiltro) return marceneiros;
    
    const q = qFiltro.toLowerCase();
    return marceneiros.filter(m => 
      m.nome.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q) ||
      m.cidade?.toLowerCase().includes(q)
    );
  }, [marceneiros, qFiltro]);

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      setSearchParams({ q: busca.trim() });
    } else {
      setSearchParams({});
    }
  }

  function clearFilters() {
    setBusca('');
    setSearchParams({});
  }

  if (loading) {
    return (
      <div className="loading" style={{ padding: '80px 20px' }}>
        <div className="spinner" />
        Carregando profissionais...
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
        <h2 style={{ color: 'var(--brown)', marginBottom: 12 }}>Erro ao Carregar</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{apiError}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <main className="page" style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div className="page__inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Header com gradiente */}
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
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              margin: '0 0 12px 0',
              fontSize: 36,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
            }}>
              🔨 Encontre seu Marceneiro
            </h1>
            <p style={{
              margin: '0 0 24px 0',
              fontSize: 16,
              opacity: 0.95,
            }}>
              {filtrados.length} {filtrados.length === 1 ? 'profissional' : 'profissionais'} verificado{filtrados.length !== 1 ? 's' : ''} disponível{filtrados.length !== 1 ? 'is' : ''}
            </p>

            {/* Barra de busca */}
            <form onSubmit={handleBusca} style={{
              display: 'flex',
              gap: 12,
              maxWidth: 600,
            }}>
              <div style={{
                flex: 1,
                position: 'relative',
              }}>
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, cidade ou especialidade..."
                  style={{
                    width: '100%',
                    padding: '14px 20px 14px 48px',
                    borderRadius: 12,
                    border: 'none',
                    fontSize: 15,
                    outline: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 20,
                }}>
                  🔍
                </span>
              </div>
              <button
                type="submit"
                style={{
                  padding: '14px 28px',
                  background: '#fff',
                  color: 'var(--brown)',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
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
                Buscar
              </button>
            </form>
          </div>
        </div>

        {/* Filtros de categoria */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px',
          marginBottom: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--brown-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>
              📂
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--brown)',
              }}>
                Filtrar por Categoria
              </h3>
              <p style={{
                margin: 0,
                fontSize: 12,
                color: 'var(--text-muted)',
              }}>
                Selecione uma especialidade
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}>
            <button
              onClick={clearFilters}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: '2px solid',
                background: !catFiltro && !qFiltro ? 'var(--brown)' : '#fff',
                color: !catFiltro && !qFiltro ? '#fff' : 'var(--brown)',
                borderColor: 'var(--brown)',
                transition: 'all 0.2s',
              }}
            >
              ✨ Todos
            </button>
            {categorias.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set('categoria', String(c.id));
                  p.delete('q');
                  setSearchParams(p);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '2px solid',
                  background: catFiltro === String(c.id) ? 'var(--brown)' : '#fff',
                  color: catFiltro === String(c.id) ? '#fff' : 'var(--brown)',
                  borderColor: 'var(--brown)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{c.icone}</span>
                <span>{c.nome}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Indicador de busca ativa */}
        {qFiltro && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: '#1e40af',
            }}>
              🔍 Buscando por: <strong>"{qFiltro}"</strong>
            </div>
            <button
              onClick={clearFilters}
              style={{
                padding: '6px 12px',
                background: '#fff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✕ Limpar
            </button>
          </div>
        )}

        {/* Grid de Marceneiros */}
        {filtrados.length === 0 ? (
          <div style={{
            background: '#fff',
            border: '2px dashed var(--border)',
            borderRadius: 16,
            padding: '80px 40px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              margin: '0 auto 24px',
            }}>
              🔍
            </div>
            
            <h2 style={{
              color: 'var(--brown)',
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
              margin: '0 0 12px 0',
            }}>
              Nenhum marceneiro encontrado
            </h2>
            
            <p style={{
              color: 'var(--text-muted)',
              fontSize: 15,
              marginBottom: 32,
              maxWidth: 500,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}>
              {catFiltro || qFiltro 
                ? 'Tente ajustar os filtros ou buscar por outros termos.'
                : 'Ainda não há marceneiros cadastrados no sistema.'}
            </p>
            
            {(catFiltro || qFiltro) && (
              <button
                onClick={clearFilters}
                className="btn-primary"
                style={{
                  padding: '14px 32px',
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                ✨ Limpar filtros e ver todos
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {filtrados.map((m, i) => {
              const avatarUrl = m.avatar 
                ? getAvatarUrl(m.avatar)
                : AVATARES[Math.abs(i) % AVATARES.length];

              return (
                <div
                  key={m.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Imagem */}
                  <div style={{
                    position: 'relative',
                    height: 220,
                    overflow: 'hidden',
                    background: '#f5f5f4',
                  }}>
                    <img
                      src={avatarUrl}
                      alt={`Foto de perfil de ${m.nome}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Badge de Destaque */}
                    {m.destaque && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        ⭐ Destaque
                      </div>
                    )}

                    {/* Overlay com gradiente */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 80,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                    }} />
                  </div>

                  {/* Informações */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Nome e Localização */}
                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{
                        margin: '0 0 6px 0',
                        fontSize: 19,
                        fontWeight: 700,
                        color: 'var(--brown)',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {m.nome}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        color: 'var(--text-muted)',
                      }}>
                        <span>📍</span>
                        <span>{m.cidade}, {m.estado}</span>
                      </div>
                    </div>

                    {/* Avaliação */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 12,
                    }}>
                      <div style={{
                        background: '#fef3c7',
                        padding: '5px 12px',
                        borderRadius: 999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#92400e',
                      }}>
                        ⭐ {(m.avaliacao_media ?? 0).toFixed(1)}
                      </div>
                      <div style={{
                        background: '#eff6ff',
                        padding: '5px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#1e40af',
                      }}>
                        🔨 {m.total_projetos ?? 0} {m.total_projetos === 1 ? 'projeto' : 'projetos'}
                      </div>
                    </div>

                    {/* Bio */}
                    {m.bio && (
                      <p style={{
                        fontSize: 13,
                        color: 'var(--text-mid)',
                        lineHeight: 1.6,
                        margin: '0 0 16px 0',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {m.bio}
                      </p>
                    )}

                    {/* Botão Ver Perfil */}
                    <Link
                      to={`/marceneiros/${m.id}`}
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
                      👁️ Ver Perfil Completo
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
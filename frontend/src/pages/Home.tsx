import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoriasApi, usuariosApi } from '../api/client';
import { getAvatarUrl } from '../utils/imageUrl';
import type { Categoria, Usuario } from '../types';

const AVATARES = [
  'https://i.pinimg.com/736x/d6/22/62/d622626725e83cdcbd5abe77e4d1f44b.jpg'
];

const HERO_IMG = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&h=700&fit=crop';
const HIW_IMGS = [
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=400&fit=crop',
  'https://www.meumoveldemadeira.com.br/cdn/shop/files/rack_para_sala_180_cm_yono_freijo_e_rattan_visto_na_diagonal_em_fundo_branco_com_medidas_escritas_na_imagem.jpg?v=1747313937&width=1200',
];

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [destaques, setDestaques] = useState<Usuario[]>([]);
  const [search, setSearch] = useState('');
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, pros] = await Promise.all([
          categoriasApi.listar(),
          usuariosApi.listar({ tipo: 'MARCENEIRO', destaque: 'true' })
        ]);
        setCategorias(cats);
        setDestaques(pros.slice(0, 3));
      } catch (err) {
        console.error('Erro ao carregar dados da Home:', err);
        setApiError('Não foi possível carregar algumas informações.');
      }
    };
    fetchData();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/marceneiros?q=${encodeURIComponent(search)}`);
  }

  return (
    <>
      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
        padding: '80px 20px',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Pattern decorativo */}
        <div style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(120,53,15,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Lado Esquerdo */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fef3c7',
              color: '#92400e',
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
            }}>
              🔨 A maior rede de marceneiros do Brasil
            </div>

            <h1 style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#1c1917',
              margin: '0 0 24px 0',
              fontFamily: 'var(--font-heading)',
            }}>
              O que você quer{' '}
              <span style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                consertar
              </span>
              {' '}ou{' '}
              <span style={{
                background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                construir
              </span>
              {' '}hoje?
            </h1>

            <p style={{
              fontSize: 18,
              color: '#57534e',
              lineHeight: 1.6,
              margin: '0 0 32px 0',
              maxWidth: 500,
            }}>
              Conecte-se com marceneiros profissionais verificados e transforme seus projetos em realidade.
            </p>

            {/* Barra de Busca */}
            <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex',
                background: '#fff',
                borderRadius: 16,
                padding: 6,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '2px solid #e7e5e4',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  padding: '0 16px',
                  gap: 12,
                }}>
                  <span style={{ fontSize: 24 }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar por nome, cidade ou especialidade..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: 15,
                      padding: '16px 0',
                      background: 'transparent',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Tags Populares */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontSize: 13,
                color: '#78716c',
                fontWeight: 600,
              }}>
                Populares:
              </span>
              {categorias.slice(0, 3).map(c => (
                  <button onClick={() => navigate(`/marceneiros?categoria=${c.id}`)}
                  style={{
                    background: '#fff',
                    color: '#57534e',
                    border: '1px solid #d6d3d1',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: '5px 8px',
                  }}   
                  >
                    {c.icone} {c.nome}
                
                </button>
              ))}
            </div>
          </div>

          {/* Lado Direito - Imagem */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative',
            }}>
              <img
                src={HERO_IMG}
                alt="Marceneiro trabalhando"
                style={{
                  width: '100%',
                  height: 500,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)',
              }} />
            </div>

            {/* Card de Avaliação */}
            <div style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              background: '#fff',
              borderRadius: 16,
              padding: '20px 24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              maxWidth: 280,
            }}>
              <div style={{
                color: '#fbbf24',
                fontSize: 20,
                marginBottom: 8,
              }}>
                ★★★★★
              </div>
              <p style={{
                fontSize: 14,
                color: '#1c1917',
                lineHeight: 1.6,
                margin: '0 0 12px 0',
                fontStyle: 'italic',
              }}>
                "O projeto do meu escritório superou todas as expectativas. Acabamento impecável."
              </p>
              <div style={{
                fontSize: 13,
                color: '#78716c',
                fontWeight: 600,
              }}>
                — Mariana Silva, SP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section style={{
        background: '#fff',
        padding: '80px 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 48,
            flexWrap: 'wrap',
            gap: 20,
          }}>
            <div>
              <h2 style={{
                fontSize: 40,
                fontWeight: 800,
                color: '#1c1917',
                margin: '0 0 12px 0',
                fontFamily: 'var(--font-heading)',
              }}>
                Explore por Ambientes
              </h2>
              <p style={{
                fontSize: 16,
                color: '#57534e',
                margin: 0,
              }}>
                Soluções planejadas por especialistas para cada m² da sua casa.
              </p>
            </div>
            <Link
              to="/marceneiros"
              style={{
                color: 'var(--brown-light)',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'gap 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.gap = '12px';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.gap = '6px';
              }}
            >
              Ver todas categorias →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
          }}>
            {categorias.length > 0
              ? categorias.slice(0, 5).map(c => (
                  <Link
                    to={`/marceneiros?categoria=${c.id}`}
                    key={c.id}
                    style={{
                      background: '#f9fafb',
                      border: '2px solid #e5e7eb',
                      borderRadius: 16,
                      padding: '32px 24px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'all 0.3s',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#fef3c7';
                      (e.currentTarget as HTMLElement).style.borderColor = '#fbbf24';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(251,191,36,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#f9fafb';
                      (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontSize: 48,
                      marginBottom: 12,
                    }}>
                      {c.icone ?? '🪵'}
                    </div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#1c1917',
                    }}>
                      {c.nome}
                    </div>
                  </Link>
                ))
              : ['Cozinha', 'Quarto', 'Sala de Estar', 'Área Gourmet', 'Escritório'].map(n => (
                  <div
                    key={n}
                    style={{
                      background: '#f9fafb',
                      border: '2px solid #e5e7eb',
                      borderRadius: 16,
                      padding: '32px 24px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🪵</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1c1917' }}>{n}</div>
                  </div>
                ))}
          </div>

          {apiError && (
            <p style={{
              textAlign: 'center',
              color: '#dc2626',
              marginTop: 24,
              fontSize: 14,
            }}>
              {apiError}
            </p>
          )}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{
        background: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
        padding: '80px 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
          }}>
            {/* Lado Esquerdo */}
            <div>
              <h2 style={{
                fontSize: 40,
                fontWeight: 800,
                color: '#1c1917',
                margin: '0 0 40px 0',
                lineHeight: 1.2,
                fontFamily: 'var(--font-heading)',
              }}>
                Tradição artesanal encontra a agilidade digital.
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { n: '01', title: 'Solicite seu Orçamento', desc: 'Descreva seu projeto ou conserto. É rápido e gratuito.', icon: '📝' },
                  { n: '02', title: 'Receba Propostas', desc: 'Marceneiros qualificados enviarão orçamentos detalhados em até 24h.', icon: '💼' },
                  { n: '03', title: 'Feche com Segurança', desc: 'Avalie o portfólio, escolha o profissional e inicie seu projeto com garantia.', icon: '✅' },
                ].map(s => (
                  <div
                    key={s.n}
                    style={{
                      display: 'flex',
                      gap: 20,
                      background: '#fff',
                      borderRadius: 16,
                      padding: '24px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(8px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    }}
                  >
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      flexShrink: 0,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 12,
                        color: '#92400e',
                        fontWeight: 700,
                        marginBottom: 4,
                        letterSpacing: 1,
                      }}>
                        PASSO {s.n}
                      </div>
                      <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#1c1917',
                        marginBottom: 6,
                      }}>
                        {s.title}
                      </div>
                      <div style={{
                        fontSize: 14,
                        color: '#57534e',
                        lineHeight: 1.6,
                      }}>
                        {s.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lado Direito - Imagens */}
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}>
                {HIW_IMGS.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transform: i === 1 ? 'translateY(40px)' : 'none',
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{
                        width: '100%',
                        height: i === 0 ? 300 : 260,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Tracker Card */}
              <div style={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                borderRadius: 16,
                padding: '20px 24px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                width: 320,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 0 3px rgba(16,185,129,0.3)',
                  }} />
                  <span style={{
                    fontSize: 12,
                    color: '#57534e',
                    fontWeight: 600,
                  }}>
                    Status do Projeto
                  </span>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1c1917',
                  marginBottom: 12,
                }}>
                  Rack para Sala
                </div>
                <div style={{
                  width: '100%',
                  height: 8,
                  background: '#e5e7eb',
                  borderRadius: 999,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}>
                  <div style={{
                    width: '65%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: 999,
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: '#78716c',
                }}>
                  <span>Corte de Peças</span>
                  <span style={{ fontWeight: 700, color: '#92400e' }}>65%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section style={{
        background: '#fff',
        padding: '80px 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: 56,
          }}>
            <h2 style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#1c1917',
              margin: '0 0 12px 0',
              fontFamily: 'var(--font-heading)',
            }}>
              Mestres da Madeira
            </h2>
            <p style={{
              fontSize: 16,
              color: '#57534e',
              margin: 0,
              maxWidth: 600,
              marginInline: 'auto',
            }}>
              Profissionais verificados com as melhores avaliações da nossa comunidade.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {destaques.length > 0
              ? destaques.map((m, i) => {
                  const avatarUrl = m.avatar 
                    ? getAvatarUrl(m.avatar)
                    : AVATARES[i % AVATARES.length];

                  return (
                    <div
                      key={m.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        position: 'relative',
                        height: 240,
                        overflow: 'hidden',
                      }}>
                        <img
                          src={avatarUrl}
                          alt={m.nome}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
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
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 80,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                        }} />
                      </div>

                      <div style={{ padding: '24px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12,
                        }}>
                          <div>
                            <div style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: '#1c1917',
                              marginBottom: 4,
                              fontFamily: 'var(--font-heading)',
                            }}>
                              {m.nome}
                            </div>
                            <div style={{
                              fontSize: 13,
                              color: '#78716c',
                            }}>
                              {m.bio?.split('.')[0] ?? 'Marceneiro profissional'}
                            </div>
                          </div>
                          <div style={{
                            background: '#fef3c7',
                            padding: '6px 12px',
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
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 16,
                          borderTop: '1px solid #e5e7eb',
                        }}>
                          <span style={{
                            fontSize: 13,
                            color: '#78716c',
                            fontWeight: 600,
                          }}>
                            🔨 {m.total_projetos} Projetos
                          </span>
                          <Link
                            to={`/marceneiros/${m.id}`}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
                              color: '#fff',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                          >
                            Ver Perfil →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              : [1, 2, 3].map(n => (
                  <div
                    key={n}
                    style={{
                      background: '#f9fafb',
                      borderRadius: 20,
                      minHeight: 400,
                    }}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: 44,
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 32px 0',
            lineHeight: 1.2,
            fontFamily: 'var(--font-heading)',
          }}>
            Dê vida ao seu próximo projeto em madeira.
          </h2>
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link
              to="/cadastro"
              style={{
                padding: '16px 32px',
                background: '#fff',
                color: '#92400e',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              ✨ Solicite seu Orçamento Grátis
            </Link>
            <Link
              to="/marceneiros"
              style={{
                padding: '16px 32px',
                background: 'transparent',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#fff';
                (e.currentTarget as HTMLElement).style.color = '#92400e';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#fff';
              }}
            >
              💬 Falar com Consultor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
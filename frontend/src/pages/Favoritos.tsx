import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoritosApi } from '../api/client';
import { getAvatarUrl } from '../utils/imageUrl';

type Marceneiro = {
  marceneiro_id: number;
  nome: string;
  bio?: string;
  cidade?: string;
  estado?: string;
  avaliacao_media: number;
  total_projetos: number;
  avatar?: string;
  destaque: number;
};

const AVATARES = [
  'https://i.pinimg.com/736x/d6/22/62/d622626725e83cdcbd5abe77e4d1f44b.jpg',
];

export default function Favoritos() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('taskpro_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [favoritos, setFavoritos] = useState<Marceneiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [removendo, setRemovendo] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    favoritosApi.listar(user.id).then(setFavoritos).finally(() => setLoading(false));
  }, [user, navigate]);

  async function remover(marceneiro_id: number) {
    if (!confirm('Remover este marceneiro dos favoritos?')) return;
    
    setRemovendo(marceneiro_id);
    try {
      await favoritosApi.remover(user.id, marceneiro_id);
      setFavoritos(prev => prev.filter(f => f.marceneiro_id !== marceneiro_id));
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
    } finally {
      setRemovendo(null);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Carregando favoritos...
      </div>
    );
  }

  return (
    <main className="page">
      <div className="page__inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            to="/dashboard"
            style={{
              color: 'var(--brown-light)',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
            }}
          >
            ← Voltar ao Perfil
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <h1 className="page__title" style={{ margin: '0 0 8px 0' }}>
                ❤️ Meus Favoritos
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                {favoritos.length} marceneiro{favoritos.length !== 1 ? 's' : ''} salvos
              </p>
            </div>

            {favoritos.length > 0 && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fde047',
                borderRadius: 12,
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{ fontSize: 28 }}>⭐</div>
                <div>
                  <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 2 }}>
                    Sua coleção
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#78350f' }}>
                    {favoritos.length} {favoritos.length === 1 ? 'marceneiro' : 'marceneiros'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Favoritos */}
        {favoritos.length === 0 ? (
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
              💔
            </div>
            
            <h2 style={{
              color: 'var(--brown)',
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
              margin: '0 0 12px 0',
            }}>
              Nenhum favorito ainda
            </h2>
            
            <p style={{
              color: 'var(--text-muted)',
              fontSize: 15,
              marginBottom: 32,
              maxWidth: 500,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}>
              Explore nossos marceneiros e salve seus favoritos para acessar rapidamente quando precisar!
            </p>
            
            <Link
              to="/marceneiros"
              className="btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              🔍 Explorar Marceneiros
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {favoritos.map((m, i) => (
              <div
                key={m.marceneiro_id}
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s',
                  opacity: removendo === m.marceneiro_id ? 0.5 : 1,
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
                {/* Imagem do Avatar */}
                <div style={{
                  position: 'relative',
                  height: 200,
                  overflow: 'hidden',
                  background: '#f5f5f4',
                }}>
                  <img
                    src={m.avatar ? getAvatarUrl(m.avatar) : AVATARES[i % AVATARES.length]}
                    alt={m.nome}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  
                  {/* Badge de Destaque */}
                  {m.destaque ? (
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
                  ) : null}

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
                <div style={{ padding: '20px' }}>
                  {/* Nome e Localização */}
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: 18,
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
                      padding: '4px 10px',
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#92400e',
                    }}>
                      ⭐ {m.avaliacao_media.toFixed(1)}
                    </div>
                    <div style={{
                      background: '#eff6ff',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#1e40af',
                    }}>
                      🔨 {m.total_projetos} {m.total_projetos === 1 ? 'projeto' : 'projetos'}
                    </div>
                  </div>

                  {/* Bio */}
                  {m.bio && (
                    <p style={{
                      fontSize: 13,
                      color: 'var(--text-mid)',
                      lineHeight: 1.6,
                      margin: '0 0 16px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {m.bio}
                    </p>
                  )}

                  {/* Botões de Ação */}
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border)',
                  }}>
                    <Link
                      to={`/marceneiros/${m.marceneiro_id}`}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      👁️ Ver Perfil
                    </Link>
                    <button
                      onClick={() => remover(m.marceneiro_id)}
                      disabled={removendo === m.marceneiro_id}
                      style={{
                        padding: '10px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        background: '#fff',
                        color: '#dc2626',
                        border: '2px solid #fecaca',
                        borderRadius: 8,
                        cursor: removendo === m.marceneiro_id ? 'not-allowed' : 'pointer',
                        opacity: removendo === m.marceneiro_id ? 0.6 : 1,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onMouseEnter={(e) => {
                        if (removendo !== m.marceneiro_id) {
                          (e.currentTarget as HTMLElement).style.background = '#fee2e2';
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#fff';
                      }}
                    >
                      {removendo === m.marceneiro_id ? '⏳' : '❤️'} Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
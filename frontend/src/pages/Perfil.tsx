import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usuariosApi } from '../api/client';
import EstadoCidadeSelect from '../components/EstadoCidadeSelect';
import SelecaoAvatar from '../components/SelecaoAvatar';

type Erros = Partial<Record<string, string>>;

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ 
    nome: '', 
    telefone: '', 
    bio: '', 
    cidade: '', 
    estado: '', 
    avatar: '',
    especialidades: '',
    anos_experiencia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [erros, setErros] = useState<Erros>({});

  useEffect(() => {
    const raw = localStorage.getItem('taskpro_user');

    if (!raw) { navigate('/login'); return; }
    const u = JSON.parse(raw);
    setUser(u);

    setForm({
      nome: u.nome || '',
      telefone: u.telefone || '',
      bio: u.bio || '',
      cidade: u.cidade || '',
      estado: u.estado || '',
      avatar: u.avatar || '',
      especialidades: u.especialidades || '',
      anos_experiencia: u.anos_experiencia || 0,
    });
    setLoading(false);
  }, [navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    console.log('💾 Iniciando salvamento...');
    console.log('📋 Dados do formulário:', form);
    
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return;
    }
    
    setErros({});
    
    // Validação manual para evitar problemas com schema
    if (!form.nome.trim()) {
      setErros({ nome: 'Nome é obrigatório' });
      setMsg('❌ Por favor, preencha o nome.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }

    setSaving(true);
    try {
      console.log('📤 Enviando para API...', { userId: user.id, data: form });
      
      // Envia TODOS os campos, incluindo avatar
      const updated = await usuariosApi.atualizar(Number(user.id), {
        nome: form.nome,
        telefone: form.telefone,
        bio: form.bio,
        cidade: form.cidade,
        estado: form.estado,
        avatar: form.avatar,
        especialidades: form.especialidades,
        anos_experiencia: form.anos_experiencia,
      });
      
      console.log('✅ Resposta da API:', updated);
      
      localStorage.setItem('taskpro_user', JSON.stringify(updated));
      setUser(updated);
      setMsg('✅ Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao salvar:', err);
      setMsg('❌ Erro ao salvar alterações. Verifique o console.');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  function handleDelete() {
    if (!user) return;
    if (!window.confirm('⚠️ Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;
    usuariosApi.deletar(Number(user.id))
      .then(() => {
        localStorage.removeItem('taskpro_user');
        navigate('/');
      })
      .catch(() => alert('Erro ao excluir conta.'));
  }

  if (loading) return <div className="loading"><div className="spinner" />Carregando...</div>;
  if (!user) return null;

  const isMarceneiro = user?.tipo === 'MARCENEIRO';

  const theme = isMarceneiro ? {
    primary: 'var(--brown-light)',
    primaryDark: 'var(--brown)',
    bg: '#fef3c7',
    bgAlt: '#fffbeb',
    text: '#92400e',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    icon: '🔨',
    title: 'Perfil do Marceneiro',
    subtitle: 'Gerencie seus serviços e atraia clientes',
  } : {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    bg: '#e0e7ff',
    bgAlt: '#eef2ff',
    text: '#3730a3',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
    icon: '👤',
    title: 'Perfil do Cliente',
    subtitle: 'Gerencie seus pedidos e favoritos',
  };

  return (
    <main className="page" style={{ background: isMarceneiro ? '#fffbeb' : '#f8fafc' }}>
      <div className="page__inner" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>

        <div style={{ marginBottom: 32 }}>
          <Link
            to="/dashboard"
            style={{
              color: theme.primary,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
            }}
          >
            ← Voltar ao Painel
          </Link>

          <div style={{
            background: theme.gradient,
            borderRadius: 16,
            padding: '32px',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}>
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

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}>
                  {form.avatar ? (
                    <img 
                      src={form.avatar.startsWith('http') ? form.avatar : `http://localhost:3001${form.avatar}`} 
                      alt={form.nome} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                    }}>
                      {theme.icon}
                    </div>
                  )}
                </div>

                <div>
                  <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>
                    {form.nome || 'Seu Nome'}
                  </h1>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.95 }}>
                    {theme.subtitle}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
              }}>
                {theme.icon} {isMarceneiro ? 'MARCENEIRO PROFISSIONAL' : 'CLIENTE'}
              </div>
            </div>
          </div>
        </div>

        {msg && (
          <div style={{
            background: msg.includes('✅') ? '#dcfce7' : '#fee2e2',
            color: msg.includes('✅') ? '#166534' : '#991b1b',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            fontWeight: 500,
            border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {msg}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 32,
          flexWrap: 'wrap',
          padding: 20,
          background: theme.bgAlt,
          borderRadius: 12,
          border: `2px solid ${theme.bg}`,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: theme.text,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            width: '100%',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            ⚡ Acesso Rápido
          </span>
          {isMarceneiro ? (
            <>
              <Link to="/meus-anuncios" style={{
                padding: '10px 20px',
                background: theme.primary,
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
                📋 Meus Anúncios
              </Link>
              <Link to="/agenda" style={{
                padding: '10px 20px',
                background: theme.primary,
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
                📅 Minha Agenda
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={{
                padding: '10px 20px',
                background: theme.primary,
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
                📦 Meus Pedidos
              </Link>
            </>
          )}
        </div>

        <div style={{
          background: '#fff',
          border: `2px solid ${theme.bg}`,
          borderRadius: 16,
          padding: 36,
          marginBottom: 32,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            marginBottom: 36,
            paddingBottom: 28,
            borderBottom: '1px dashed var(--border)',
          }}>
            <label style={{
              display: 'block',
              fontSize: 16,
              fontWeight: 700,
              color: theme.primaryDark,
              marginBottom: 16,
            }}>
              {isMarceneiro ? '📸 Foto de Perfil Profissional' : '📸 Sua Foto'}
            </label>
            <SelecaoAvatar
              avatarAtual={form.avatar}
              onSelecionar={(url) => {
                console.log('🖼️ Foto selecionada:', url);
                setForm(f => ({ ...f, avatar: url }));
              }}
              onUpload={async (file) => {
                console.log('📤 Iniciando upload...', file);
                
                const formData = new FormData();
                formData.append('avatar', file);
                
                try {
                  const response = await fetch('/api/upload/avatar', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  console.log('📡 Status da resposta:', response.status);
                  
                  const data = await response.json();
                  console.log('✅ Dados do upload:', data);
                  
                  if (data.url) {
                    console.log('🔗 URL da imagem:', data.url);
                    // ✅ Apenas atualiza o form, NÃO faz update no banco ainda
                    setForm(f => ({ ...f, avatar: data.url }));
                    setMsg('✅ Foto carregada! Clique em "Salvar Alterações" para confirmar.');
                    setTimeout(() => setMsg(''), 3000);
                  }
                } catch (err) {
                  console.error('❌ Erro no upload:', err);
                  setMsg('❌ Erro ao fazer upload da foto.');
                  setTimeout(() => setMsg(''), 3000);
                }
              }}
            />
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                👤 Nome {isMarceneiro ? 'Profissional' : 'Completo'} *
              </label>
              <input
                className="form-input"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder={isMarceneiro ? "Ex: João Silva - Marcenaria" : "Digite seu nome completo"}
                required
              />
              {erros.nome && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.nome}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                📱 Telefone
              </label>
              <input
                className="form-input"
                placeholder="(11) 99999-0000"
                value={form.telefone}
                onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
              />
            </div>

            {isMarceneiro && (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    🛠️ Especialidades
                  </label>
                  <input
                    className="form-input"
                    placeholder="Ex: Móveis planejados, cozinhas, armários"
                    value={form.especialidades}
                    onChange={e => setForm(f => ({ ...f, especialidades: e.target.value }))}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Separe por vírgulas
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    ⏱️ Anos de Experiência
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={50}
                    placeholder="Ex: 10"
                    value={form.anos_experiencia || ''}
                    onChange={e => setForm(f => ({ ...f, anos_experiencia: Number(e.target.value) }))}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                {isMarceneiro ? '💼 Sobre sua Marcenaria' : '📝 Sobre Você'}
              </label>
              <textarea
                className="form-input"
                rows={5}
                placeholder={
                  isMarceneiro
                    ? 'Conte sobre sua experiência, tipos de móveis que produz, materiais que utiliza, diferenciais...'
                    : 'Descreva um pouco sobre você e seus interesses...'
                }
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
              {erros.bio && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.bio}</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {form.bio.length}/500 caracteres
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                📍 Localização *   
              </label>
              <EstadoCidadeSelect
                estado={form.estado}
                cidade={form.cidade}
                onEstadoChange={v => setForm(f => ({ ...f, estado: v }))}
                onCidadeChange={v => setForm(f => ({ ...f, cidade: v }))}
                error={{ estado: erros.estado, cidade: erros.cidade }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              marginTop: 12,
              paddingTop: 24,
              borderTop: '1px solid var(--border)',
            }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  background: saving ? '#d1d5db' : theme.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {saving ? '⏳ Salvando...' : '💾 Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>

        <div style={{
          background: '#fff5f5',
          border: '1px solid #fecaca',
          borderRadius: 12,
          padding: 28,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fee2e2',
            color: '#991b1b',
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16,
          }}>
            ⚠️ Zona de Perigo
          </div>
          <p style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 20,
            maxWidth: 420,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Ao excluir sua conta, todos os seus dados, {isMarceneiro ? 'anúncios' : 'pedidos'} e histórico serão removidos permanentemente.
          </p>
          <button
            style={{
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 700,
              background: '#fff',
              color: '#dc2626',
              border: '2px solid #dc2626',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={handleDelete}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#dc2626';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#fff';
              (e.currentTarget as HTMLElement).style.color = '#dc2626';
            }}
          >
            🗑️ Excluir Minha Conta
          </button>
        </div>
      </div>
    </main>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { servicosApi, categoriasApi } from '../api/client';
import { anuncioSchema, type AnuncioForm } from '../lib/validations';
import type { Servico, Categoria } from '../types';

type Erros = Partial<Record<string, string>>;
const VAZIO: AnuncioForm = { titulo: '', descricao: '', preco_base: 0, categoria_id: 0, tempo_estimado: '' };

export default function MeusAnuncios() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('taskpro_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<AnuncioForm>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');

  useEffect(() => {
    if (!user || user.tipo !== 'MARCENEIRO') { navigate('/dashboard'); return; }
    Promise.all([
      servicosApi.listar({ marceneiro_id: user.id }),
      categoriasApi.listar(),
    ]).then(([s, c]) => { 
      setServicos(s); 
      setCategorias(c); 
      setLoading(false); 
    });
  }, [user, navigate]);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  function set(k: keyof AnuncioForm, v: string | number) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErros({});
    const result = anuncioSchema.safeParse({ 
      ...form, 
      preco_base: Number(form.preco_base), 
      categoria_id: Number(form.categoria_id) 
    });
    
    if (!result.success) {
      const map: Erros = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.error.issues.forEach((e: any) => { 
        if (e.path[0]) map[String(e.path[0])] = e.message; 
      });
      setErros(map);
      setMsg({ type: 'error', text: '⚠️ Por favor, corrija os erros no formulário.' });
      return;
    }

    try {
      if (editandoId) {
        await servicosApi.atualizar(editandoId, { ...form, marceneiro_id: user.id });
        setMsg({ type: 'success', text: '✅ Anúncio atualizado com sucesso!' });
      } else {
        await servicosApi.criar({ ...form, marceneiro_id: user.id });
        setMsg({ type: 'success', text: '✅ Anúncio criado com sucesso!' });
      }
      const novos = await servicosApi.listar({ marceneiro_id: user.id });
      setServicos(novos);
      setForm(VAZIO);
      setEditandoId(null);
      setMostrarForm(false);
    } catch {
      setMsg({ type: 'error', text: '❌ Erro ao salvar anúncio.' });
    }
  }

  async function toggleStatus(s: Servico) {
    const novoStatus = s.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    try {
      await servicosApi.atualizar(s.id, { ...s, status: novoStatus });
      setServicos(prev => prev.map(x => x.id === s.id ? { ...x, status: novoStatus } : x));
      setMsg({ 
        type: 'success', 
        text: novoStatus === 'ATIVO' ? '✅ Anúncio ativado!' : '⏸️ Anúncio pausado.' 
      });
    } catch {
      setMsg({ type: 'error', text: '❌ Erro ao alterar status.' });
    }
  }

  async function excluir(id: number) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')) return;
    try {
      await servicosApi.deletar(id);
      setServicos(prev => prev.filter(x => x.id !== id));
      setMsg({ type: 'success', text: '🗑️ Anúncio excluído com sucesso.' });
    } catch {
      setMsg({ type: 'error', text: '❌ Erro ao excluir anúncio.' });
    }
  }

  function editar(s: Servico) {
    setForm({ 
      titulo: s.titulo, 
      descricao: s.descricao, 
      preco_base: s.preco_base, 
      categoria_id: s.categoria_id, 
      tempo_estimado: s.tempo_estimado ?? '' 
    });
    setEditandoId(s.id);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Estatísticas
  const totalAnuncios = servicos.length;
  const ativos = servicos.filter(s => s.status === 'ATIVO').length;
  const inativos = servicos.filter(s => s.status === 'INATIVO').length;

  // Filtrar por status
  const servicosFiltrados = filtroStatus === 'TODOS' 
    ? servicos 
    : servicos.filter(s => s.status === filtroStatus);

  if (loading) {
    return (
      <div className="loading" style={{ padding: '80px 20px' }}>
        <div className="spinner" />
        Carregando anúncios...
      </div>
    );
  }

  return (
    <main className="page" style={{ background: '#f9fafb', minHeight: '100vh' }}>
      <div className="page__inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            to="/perfil"
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
                📋 Meus Anúncios
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                Gerencie seus serviços e ofertas
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={() => { 
                setForm(VAZIO); 
                setEditandoId(null); 
                setMostrarForm(v => !v); 
              }}
              style={{
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {mostrarForm ? '✕ Cancelar' : '+ Novo Anúncio'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total de Anúncios
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--brown)' }}>
              {totalAnuncios}
            </div>
          </div>

          <div style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ✅ Ativos
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>
              {ativos}
            </div>
          </div>

          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ⏸️ Inativos
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#991b1b' }}>
              {inativos}
            </div>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {msg && (
          <div style={{
            background: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: msg.type === 'success' ? '#166534' : '#991b1b',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            fontWeight: 500,
            border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {msg.text}
          </div>
        )}

        {/* Formulário */}
        {mostrarForm && (
          <form
            onSubmit={salvar}
            style={{
              background: '#fff',
              border: '2px solid var(--brown-light)',
              borderRadius: 12,
              padding: 32,
              marginBottom: 32,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--brown-light)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}>
                {editandoId ? '✏️' : '✨'}
              </div>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 20,
                  color: 'var(--brown)',
                  margin: 0,
                }}>
                  {editandoId ? 'Editar Anúncio' : 'Novo Anúncio'}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  {editandoId ? 'Atualize as informações do seu serviço' : 'Preencha os dados para publicar seu serviço'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  📝 Título do Serviço *
                </label>
                <input
                  className="form-input"
                  placeholder="Ex: Cozinha Planejada Completa"
                  value={form.titulo}
                  onChange={e => set('titulo', e.target.value)}
                />
                {erros.titulo && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.titulo}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  💬 Descrição *
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Descreva o serviço em detalhes: materiais utilizados, acabamentos, medidas padrão, etc."
                  value={form.descricao}
                  onChange={e => set('descricao', e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                {erros.descricao && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.descricao}</span>}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {form.descricao.length}/500 caracteres
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    📂 Categoria *
                  </label>
                  <select
                    className="form-select"
                    value={form.categoria_id}
                    onChange={e => set('categoria_id', Number(e.target.value))}
                  >
                    <option value={0}>Selecione uma categoria</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
                    ))}
                  </select>
                  {erros.categoria_id && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.categoria_id}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    💰 Preço Base (R$) *
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="1500.00"
                    value={form.preco_base || ''}
                    onChange={e => set('preco_base', Number(e.target.value))}
                  />
                  {erros.preco_base && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.preco_base}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    ⏱️ Prazo Estimado
                  </label>
                  <input
                    className="form-input"
                    placeholder="Ex: 10–15 dias"
                    value={form.tempo_estimado}
                    onChange={e => set('tempo_estimado', e.target.value)}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 12,
                marginTop: 8,
                paddingTop: 20,
                borderTop: '1px solid var(--border)',
              }}>
                <button
                  className="btn-primary"
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {editandoId ? '💾 Salvar Alterações' : '✨ Publicar Anúncio'}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setMostrarForm(false);
                    setForm(VAZIO);
                    setEditandoId(null);
                    setErros({});
                  }}
                  style={{
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filtro de Status */}
        {servicos.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}>
            {(['TODOS', 'ATIVO', 'INATIVO'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '2px solid',
                  background: filtroStatus === status ? 'var(--brown)' : '#fff',
                  color: filtroStatus === status ? '#fff' : 'var(--brown)',
                  borderColor: 'var(--brown)',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'TODOS' ? '✨ Todos' : status === 'ATIVO' ? '✅ Ativos' : '⏸️ Inativos'}
              </button>
            ))}
          </div>
        )}

        {/* Lista de Anúncios */}
        {servicos.length === 0 ? (
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
              📋
            </div>
            
            <h2 style={{
              color: 'var(--brown)',
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
              margin: '0 0 12px 0',
            }}>
              Nenhum anúncio publicado
            </h2>
            
            <p style={{
              color: 'var(--text-muted)',
              fontSize: 15,
              marginBottom: 32,
              maxWidth: 500,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}>
              Comece agora mesmo criando seu primeiro anúncio e atraia clientes!
            </p>
            
            <button
              className="btn-primary"
              onClick={() => setMostrarForm(true)}
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              ✨ Criar Primeiro Anúncio
            </button>
          </div>
        ) : servicosFiltrados.length === 0 ? (
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Nenhum anúncio com este filtro.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {servicosFiltrados.map(s => (
              <div
                key={s.id}
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                  opacity: s.status === 'INATIVO' ? 0.7 : 1,
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 20,
                  flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Título e Status */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                      flexWrap: 'wrap',
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--brown)',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {s.titulo}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: s.status === 'ATIVO' ? '#dcfce7' : '#fee2e2',
                        color: s.status === 'ATIVO' ? '#166534' : '#991b1b',
                      }}>
                        {s.status === 'ATIVO' ? '✅' : '⏸️'} {s.status}
                      </span>
                    </div>

                    {/* Meta informações */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      marginBottom: 12,
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#1e40af',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        📂 {s.categoria_nome}
                      </span>
                      <span>⏱️ {s.tempo_estimado ?? 'Prazo a combinar'}</span>
                    </div>



                    {/* Descrição */}
                    {s.descricao && (
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: 13,
                        color: 'var(--text-mid)',
                        lineHeight: 1.6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {s.descricao}
                      </p>
                    )}
                  </div>

                  {/* Lado direito: Preço e Ações */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: 'var(--brown)',
                      fontFamily: 'var(--font-heading)',
                      marginBottom: 12,
                    }}>
                      R$ {s.preco_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    {/* Botões de Ação */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-ghost"
                        onClick={() => editar(s)}
                        style={{
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          background: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => toggleStatus(s)}
                        style={{
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          background: s.status === 'ATIVO' ? '#fef3c7' : '#dcfce7',
                          color: s.status === 'ATIVO' ? '#92400e' : '#166534',
                          border: '1px solid',
                          borderColor: s.status === 'ATIVO' ? '#fde047' : '#bbf7d0',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {s.status === 'ATIVO' ? '⏸️ Pausar' : '▶️ Ativar'}
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => excluir(s.id)}
                        style={{
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
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
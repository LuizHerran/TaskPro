import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { agendaApi } from '../api/client';
import { agendaSchema, type AgendaForm } from '../lib/validations';

type SlotAgenda = {
  id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  disponivel: number;
  observacao?: string;
  cliente_nome?: string;
  pedido_descricao?: string;
};
type Erros = Partial<Record<string, string>>;

const VAZIO: AgendaForm = { data: '', hora_inicio: '', hora_fim: '', observacao: '' };

export default function Agenda() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('taskpro_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [slots, setSlots] = useState<SlotAgenda[]>([]);
  const [form, setForm] = useState<AgendaForm>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user || user.tipo !== 'MARCENEIRO') { navigate('/dashboard'); return; }
    agendaApi.listar(user.id).then(setSlots).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  function set(k: keyof AgendaForm, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErros({});
    const result = agendaSchema.safeParse(form);
    if (!result.success) {
      const map: Erros = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.error.issues.forEach((e: any) => { if (e.path[0]) map[String(e.path[0])] = e.message; });
      setErros(map);
      return;
    }
    try {
      await agendaApi.criar({ ...form, marceneiro_id: user.id });
      const novos = await agendaApi.listar(user.id);
      setSlots(novos);
      setForm(VAZIO);
      setMostrarForm(false);
      setMsg({ type: 'success', text: '✅ Horário adicionado com sucesso!' });
    } catch {
      setMsg({ type: 'error', text: '❌ Erro ao adicionar horário.' });
    }
  }

  async function remover(id: number) {
    if (!confirm('Remover este horário da agenda?')) return;
    try {
      await agendaApi.deletar(id);
      setSlots(prev => prev.filter(s => s.id !== id));
      setMsg({ type: 'success', text: '🗑️ Horário removido.' });
    } catch {
      setMsg({ type: 'error', text: '❌ Erro ao remover horário.' });
    }
  }

  // Estatísticas
  const totalHorarios = slots.length;
  const disponiveis = slots.filter(s => s.disponivel).length;
  const ocupados = slots.filter(s => !s.disponivel).length;

  // Agrupar por data
  const porData = slots.reduce<Record<string, SlotAgenda[]>>((acc, s) => {
    const d = s.data;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  // Verificar se é data passada
  const hoje = new Date().toISOString().split('T')[0];

  if (loading) return <div className="loading"><div className="spinner" />Carregando...</div>;

  return (
    <main className="page">
      <div className="page__inner" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

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
            gap: 12,
          }}>
            <div>
              <h1 className="page__title" style={{ margin: 0 }}>📅 Minha Agenda</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                Gerencie seus horários disponíveis e compromissos
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={() => setMostrarForm(v => !v)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {mostrarForm ? '✕ Cancelar' : '+ Adicionar Horário'}
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
              Total de Horários
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--brown)' }}>
              {totalHorarios}
            </div>
          </div>

          <div style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              🟢 Disponíveis
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>
              {disponiveis}
            </div>
          </div>

          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              🔴 Ocupados
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#991b1b' }}>
              {ocupados}
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
            onSubmit={adicionar}
            style={{
              background: '#fff',
              border: '2px solid var(--brown-light)',
              borderRadius: 12,
              padding: 28,
              marginBottom: 32,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--brown-light)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                🕐
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 17,
                  color: 'var(--brown)',
                  margin: 0,
                }}>
                  Novo horário disponível
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Defina quando você estará disponível para atender
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Data *</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.data}
                  min={hoje}
                  onChange={e => set('data', e.target.value)}
                />
                {erros.data && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.data}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Início *</label>
                <input
                  className="form-input"
                  type="time"
                  value={form.hora_inicio}
                  onChange={e => set('hora_inicio', e.target.value)}
                />
                {erros.hora_inicio && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.hora_inicio}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Fim *</label>
                <input
                  className="form-input"
                  type="time"
                  value={form.hora_fim}
                  onChange={e => set('hora_fim', e.target.value)}
                />
                {erros.hora_fim && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.hora_fim}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Observação (opcional)</label>
              <input
                className="form-input"
                placeholder="Ex: Disponível para visita técnica ou medição"
                value={form.observacao}
                onChange={e => set('observacao', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                className="btn-primary"
                type="submit"
                style={{ padding: '11px 24px', fontSize: 14, fontWeight: 600 }}
              >
                💾 Salvar horário
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setMostrarForm(false);
                  setForm(VAZIO);
                  setErros({});
                }}
                style={{ padding: '11px 20px', fontSize: 14 }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de datas */}
        {Object.keys(porData).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            border: '2px dashed var(--border)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--brown)',
              fontSize: 18,
              marginBottom: 8,
            }}>
              Sua agenda está vazia
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: 14,
              marginBottom: 24,
              maxWidth: 400,
              margin: '0 auto 24px',
            }}>
              Adicione seus primeiros horários disponíveis para que os clientes possam agendar serviços com você.
            </p>
            <button
              className="btn-primary"
              onClick={() => setMostrarForm(true)}
              style={{ padding: '11px 24px', fontSize: 14, fontWeight: 600 }}
            >
              + Adicionar primeiro horário
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(porData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([data, slotsData]) => {
                const dataObj = new Date(data + 'T12:00:00');
                const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
                const diaCompleto = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                const ehPassada = data < hoje;
                const dispDia = slotsData.filter(s => s.disponivel).length;

                return (
                  <div
                    key={data}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      opacity: ehPassada ? 0.6 : 1,
                    }}
                  >
                    {/* Cabeçalho da data */}
                    <div style={{
                      padding: '16px 20px',
                      background: ehPassada ? '#f5f5f4' : 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
                      color: ehPassada ? 'var(--text-muted)' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          fontSize: 28,
                          fontWeight: 700,
                          fontFamily: 'var(--font-heading)',
                        }}>
                          {dataObj.toLocaleDateString('pt-BR', { day: '2-digit' })}
                        </div>
                        <div>
                          <div style={{
                            fontSize: 15,
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}>
                            {diaSemana}
                          </div>
                          <div style={{
                            fontSize: 12,
                            opacity: 0.85,
                            textTransform: 'capitalize',
                          }}>
                            {diaCompleto}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                      }}>
                        {ehPassada && (
                          <span style={{
                            background: 'rgba(0,0,0,0.15)',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                          }}>
                            PASSADA
                          </span>
                        )}
                        <span style={{
                          background: ehPassada ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                          padding: '4px 12px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          {dispDia} de {slotsData.length} disponíveis
                        </span>
                      </div>
                    </div>

                    {/* Lista de horários do dia */}
                    <div style={{ padding: '12px 20px' }}>
                      {slotsData.map(s => (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '14px 16px',
                            marginBottom: 8,
                            background: s.disponivel ? '#f9fafb' : '#fef2f2',
                            border: '1px solid',
                            borderColor: s.disponivel ? '#e5e7eb' : '#fecaca',
                            borderRadius: 10,
                            transition: 'all 0.2s',
                          }}
                        >
                          {/* Indicador de status */}
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: s.disponivel ? '#dcfce7' : '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            flexShrink: 0,
                          }}>
                            {s.disponivel ? '🟢' : '🔴'}
                          </div>

                          {/* Info do horário */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{
                                fontWeight: 700,
                                fontSize: 15,
                                color: 'var(--brown)',
                                fontFamily: 'var(--font-heading)',
                              }}>
                                🕐 {s.hora_inicio} – {s.hora_fim}
                              </span>
                              {s.cliente_nome && (
                                <span style={{
                                  background: '#fee2e2',
                                  color: '#991b1b',
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}>
                                  👤 {s.cliente_nome}
                                </span>
                              )}
                            </div>
                            {s.observacao && (
                              <div style={{
                                fontSize: 12,
                                color: 'var(--text-muted)',
                                marginTop: 4,
                              }}>
                                💬 {s.observacao}
                              </div>
                            )}
                            {s.pedido_descricao && (
                              <div style={{
                                fontSize: 12,
                                color: 'var(--text-muted)',
                                marginTop: 4,
                                fontStyle: 'italic',
                              }}>
                                📋 {s.pedido_descricao}
                              </div>
                            )}
                          </div>

                          {/* Status + ação */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className={`status-badge ${s.disponivel ? 'status-badge--concluido' : 'status-badge--em_andamento'}`}>
                              {s.disponivel ? 'Disponível' : 'Ocupado'}
                            </span>
                            {s.disponivel && (
                              <button
                                className="btn-ghost"
                                style={{
                                  fontSize: 12,
                                  padding: '6px 12px',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  background: '#fff',
                                }}
                                onClick={() => remover(s.id)}
                                title="Remover horário"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
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
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicosApi, pedidosApi, agendaApi } from '../api/client';
import { contratarSchema, type ContratarForm } from '../lib/validations';
import type { Servico } from '../types';

type SlotAgenda = { id: number; data: string; hora_inicio: string; hora_fim: string; };
type Erros = Partial<Record<string, string>>;

export default function Contratar() {
  const { servicoId } = useParams<{ servicoId: string }>();
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('taskpro_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [servico, setServico] = useState<Servico | null>(null);
  const [slots, setSlots] = useState<SlotAgenda[]>([]);
  const [form, setForm] = useState<ContratarForm>({ descricao: '', endereco: '', data_agendada: '' });
  const [erros, setErros] = useState<Erros>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!servicoId) { navigate('/marceneiros'); return; }
    
    Promise.all([
      servicosApi.buscar(Number(servicoId)),
      agendaApi.listar(0).catch(() => []),
    ]).then(([s]) => {
      setServico(s);
      agendaApi.listar(s.marceneiro_id).then(a => setSlots(a.filter((sl: SlotAgenda & { disponivel: number }) => sl.disponivel)));
      setLoading(false);
    });
  }, [servicoId, navigate]);

  function set(k: keyof ContratarForm, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function criarPedido(e: React.FormEvent) {
    e.preventDefault();
    setErros({});
    
    const result = contratarSchema.safeParse(form);
    if (!result.success) {
      const map: Erros = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.error.issues.forEach((err: any) => { if (err.path[0]) map[String(err.path[0])] = err.message; });
      setErros(map);
      return;
    }
    
    if (!servico || !user) return;
    setSalvando(true);
    
    try {
      // 1. Cria o pedido no banco de dados
      const pedido = await pedidosApi.criar({
        servico_id: servico.id,
        cliente_id: user.id,
        marceneiro_id: servico.marceneiro_id,
        descricao: form.descricao,
        endereco: form.endereco,
        data_agendada: form.data_agendada,
        valor: servico.preco_base,
      });

      // 2. Prepara os dados para a página de simulação
      const params = new URLSearchParams({
        pedido_id: String(pedido.id),
        valor: String(servico.preco_base),
        descricao: servico.titulo,
        nome: user.nome,
        email: user.email,
      });

      // 3. Redireciona para a simulação de pagamento
      navigate(`/simulacao-pagamento?${params.toString()}`);
      
    } catch (err) {
      console.error(err);
      setErros({ geral: 'Erro ao criar pedido. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  }

  // Agrupar slots por data
  const slotsPorData = slots.reduce<Record<string, SlotAgenda[]>>((acc, s) => {
    if (!acc[s.data]) acc[s.data] = [];
    acc[s.data].push(s);
    return acc;
  }, {});

  if (loading) return <div className="loading"><div className="spinner" />Carregando...</div>;
  if (!servico) return <div className="loading">Serviço não encontrado.</div>;

  return (
    <main className="page">
      <div className="page__inner" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        
        {/* Breadcrumb */}
        <Link
          to={`/marceneiros/${servico.marceneiro_id}`}
          style={{
            color: 'var(--brown-light)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
          }}
        >
          ← Voltar ao perfil do marceneiro
        </Link>

        {/* Indicador de Etapa */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 32,
          padding: '20px',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            background: 'var(--brown-light)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
          }}>
            <span style={{ fontSize: 16 }}>📝</span> Detalhes
          </div>
          <div style={{ width: 40, height: 2, background: 'var(--border)' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            background: '#f5f5f4',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 13,
          }}>
            <span style={{ fontSize: 16 }}></span> Pagamento
          </div>
          <div style={{ width: 40, height: 2, background: 'var(--border)' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            background: '#f5f5f4',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 13,
          }}>
            <span style={{ fontSize: 16 }}>✅</span> Confirmado
          </div>
        </div>

        {/* Card do Serviço */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
          borderRadius: 16,
          padding: 28,
          marginBottom: 32,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 12,
              }}>
                ️ Serviço Selecionado
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, margin: '0 0 8px 0' }}>
                {servico.titulo}
              </h2>
              <div style={{ fontSize: 14, opacity: 0.95, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>👷 {servico.marceneiro_nome}</span>
                {servico.tempo_estimado && (
                  <>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>⏱️ {servico.tempo_estimado}</span>
                  </>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Valor Total</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, lineHeight: 1 }}>
                R$ {servico.preco_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro geral */}
        {erros.geral && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            fontWeight: 500,
            border: '1px solid #fecaca',
          }}>
            ⚠️ {erros.geral}
          </div>
        )}

        {/* Formulário */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h1 className="page__title" style={{ margin: '0 0 8px 0' }}>📝 Detalhes do Pedido</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Preencha as informações abaixo para solicitar o serviço
            </p>
          </div>

          <form onSubmit={criarPedido} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Descrição */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                💬 O que você precisa? *
              </label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Descreva detalhes do projeto, medidas, materiais preferidos, cores, acabamento desejado, etc."
                value={form.descricao}
                onChange={e => set('descricao', e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
              {erros.descricao && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.descricao}</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {form.descricao.length}/500 caracteres
              </span>
            </div>

            {/* Endereço */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                📍 Endereço para o serviço *
              </label>
              <input
                className="form-input"
                placeholder="Rua, número, bairro, cidade - CEP"
                value={form.endereco}
                onChange={e => set('endereco', e.target.value)}
              />
              {erros.endereco && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.endereco}</span>}
            </div>

            {/* Data */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                📅 Data desejada *
              </label>
              
              {Object.keys(slotsPorData).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>
                    ✨ Horários disponíveis do marceneiro:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.entries(slotsPorData).slice(0, 3).map(([data, slotsData]) => (
                      <div key={data}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--brown)', marginBottom: 8, textTransform: 'capitalize' }}>
                          {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {slotsData.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => set('data_agendada', s.data)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: '2px solid',
                                background: form.data_agendada === s.data ? 'var(--brown)' : '#fff',
                                color: form.data_agendada === s.data ? '#fff' : 'var(--brown)',
                                borderColor: 'var(--brown)',
                                transition: 'all 0.2s',
                              }}
                            >
                              🕐 {s.hora_inicio} – {s.hora_fim}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, fontStyle: 'italic' }}>
                    Ou escolha outra data abaixo:
                  </p>
                </div>
              )}

              <input
                className="form-input"
                type="date"
                value={form.data_agendada}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('data_agendada', e.target.value)}
              />
              {erros.data_agendada && <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>{erros.data_agendada}</span>}
            </div>

            {/* Info Box */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 10,
              padding: 16,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>💡</div>
              <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                <strong>Como funciona:</strong> Ao confirmar, o pedido será criado e você será redirecionado para a tela de pagamento seguro via PIX.
              </div>
            </div>

            {/* Botão Submit */}
            <button
              className="btn-full"
              type="submit"
              disabled={salvando}
              style={{
                padding: '16px 24px',
                fontSize: 16,
                fontWeight: 700,
                marginTop: 8,
                opacity: salvando ? 0.7 : 1,
                cursor: salvando ? 'not-allowed' : 'pointer',
              }}
            >
              {salvando ? '⏳ Criando pedido...' : `💳 Confirmar e Pagar R$ ${servico.preco_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
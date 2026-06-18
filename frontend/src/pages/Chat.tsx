import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mensagensApi, usuariosApi } from '../api/client';
import { getAvatarUrl } from '../utils/imageUrl';

interface Mensagem {
  id: number;
  remetente_id: number;
  destinatario_id: number;
  conteudo: string;
  created_at?: string;
}

interface Contato {
  id: number;
  nome: string;
  avatar?: string;
  tipo?: string;
}

export default function Chat() {
  const { id } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userRaw = localStorage.getItem('taskpro_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [contato, setContato] = useState<Contato | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Carregar informações do contato
  async function carregarContato() {
    if (!id) return;
    try {
      const data = await usuariosApi.buscar(Number(id));
      setContato(data);
    } catch (err) {
      console.error('Erro ao carregar contato:', err);
    }
  }

  // Carregar mensagens
  async function carregar() {
    if (!id || !user?.id) return;

    try {
      const data = await mensagensApi.listarConversa(user.id, Number(id));
      setMensagens(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Erro chat:', err);
      setLoading(false);
    }
  }

  // Enviar mensagem
  async function enviar(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!texto.trim() || !user?.id || enviando) return;

    setEnviando(true);
    try {
      await mensagensApi.enviar({
        remetente_id: user.id,
        destinatario_id: Number(id),
        conteudo: texto.trim()
      });

      setTexto('');
      await carregar();
      inputRef.current?.focus();
    } catch (err) {
      console.error('Erro envio:', err);
    } finally {
      setEnviando(false);
    }
  }

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarContato();
    carregar();

    const interval = setInterval(carregar, 2000);
    return () => clearInterval(interval);
  }, [id]);

  // Formatar horário
  function formatarHora(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // Formatar data
  function formatarData(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (date.toDateString() === hoje.toDateString()) return 'Hoje';
    if (date.toDateString() === ontem.toDateString()) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Agrupar mensagens por data
  function agruparPorData(msgs: Mensagem[]): Record<string, Mensagem[]> {
    return msgs.reduce((acc, msg) => {
      const data = msg.created_at ? new Date(msg.created_at).toDateString() : 'unknown';
      if (!acc[data]) acc[data] = [];
      acc[data].push(msg);
      return acc;
    }, {} as Record<string, Mensagem[]>);
  }

  if (!user?.id) {
    return (
      <div className="page">
        <div className="page__inner" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
          <h2 style={{ color: 'var(--brown)', marginBottom: 12 }}>Acesso Restrito</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Você precisa estar logado para usar o chat
          </p>
          <Link to="/login" className="btn-primary">Fazer Login</Link>
        </div>
      </div>
    );
  }

  const mensagensAgrupadas = agruparPorData(mensagens);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        
        {/* Header do Chat */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: '1px solid var(--border)',
        }}>
          <Link
            to="/dashboard"
            style={{
              color: '#fff',
              fontSize: 20,
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ←
          </Link>

          {/* Avatar do contato */}
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}>
            {contato?.avatar ? (
              <img src={getAvatarUrl(contato.avatar)} alt={contato.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              contato?.tipo === 'MARCENEIRO' ? '👷' : '👤'
            )}
          </div>

          {/* Info do contato */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {contato?.nome || 'Carregando...'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {contato?.tipo === 'MARCENEIRO' ? 'Marceneiro' : 'Cliente'}
            </div>
          </div>

          {/* Status online */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            background: 'rgba(255,255,255,0.15)',
            padding: '4px 10px',
            borderRadius: 999,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 0 2px rgba(16,185,129,0.3)',
            }} />
            Online
          </div>
        </div>

        {/* Área de Mensagens */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#f9fafb',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              Carregando mensagens...
            </div>
          ) : mensagens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>👋</div>
              <h3 style={{ color: 'var(--brown)', marginBottom: 8 }}>Inicie a conversa!</h3>
              <p style={{ fontSize: 14 }}>
                Envie a primeira mensagem para {contato?.nome || 'este contato'}
              </p>
            </div>
          ) : (
            Object.entries(mensagensAgrupadas).map(([data, msgs]) => (
              <div key={data}>
                {/* Separador de data */}
                <div style={{
                  textAlign: 'center',
                  margin: '20px 0 16px',
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#fff',
                    padding: '4px 14px',
                    borderRadius: 999,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    border: '1px solid var(--border)',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    {formatarData(msgs[0]?.created_at)}
                  </div>
                </div>

                {/* Mensagens do dia */}
                {msgs.map((m) => {
                  const ehMinha = m.remetente_id === user.id;
                  
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: ehMinha ? 'flex-end' : 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: ehMinha ? 'flex-end' : 'flex-start',
                      }}>
                        {/* Bolha da mensagem */}
                        <div style={{
                          background: ehMinha 
                            ? 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)'
                            : '#fff',
                          color: ehMinha ? '#fff' : 'var(--text)',
                          padding: '10px 14px',
                          borderRadius: ehMinha ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          wordBreak: 'break-word',
                          lineHeight: 1.5,
                          fontSize: 14,
                        }}>
                          {m.conteudo}
                        </div>
                        
                        {/* Horário */}
                        <div style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          marginTop: 4,
                          padding: '0 4px',
                        }}>
                          {formatarHora(m.created_at)}
                          {ehMinha && ' ✓'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        <form
          onSubmit={enviar}
          style={{
            padding: '16px 20px',
            background: '#fff',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 10,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={enviando}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: 24,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brown-light)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            style={{
              padding: '12px 20px',
              background: (!texto.trim() || enviando) ? '#d1d5db' : 'var(--brown-light)',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              fontSize: 14,
              fontWeight: 600,
              cursor: (!texto.trim() || enviando) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {enviando ? '⏳' : '📤'} Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
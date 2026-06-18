import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

interface SimulacaoDados {
  pedidoId: number;
  valor: number;
  descricao: string;
  nomePagador: string;
  emailPagador: string;
}

export default function SimulacaoPagamento() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  
  const [dados, setDados] = useState<SimulacaoDados>({
    pedidoId: Number(params.get('pedido_id')) || 123,
    valor: Number(params.get('valor')) || 150.00,
    descricao: params.get('descricao') || 'Serviço de Marcenaria - Armário Embutido',
    nomePagador: params.get('nome') || 'João Silva',
    emailPagador: params.get('email') || 'joao@email.com',
  });

  const [modoSimulacao, setModoSimulacao] = useState<'sucesso' | 'falha' | 'pendente' | 'expirado'>('sucesso');
  const [pixCode, setPixCode] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(1800); // 30 minutos
  const [processando, setProcessando] = useState(false);
  const [statusPagamento, setStatusPagamento] = useState<'aguardando' | 'pago' | 'falhou' | 'expirado'>('aguardando');

  // Gerar código PIX simulado
  useEffect(() => {
    const codigoSimulado = `00020126580014BR.GOV.BCB.PIX0136joao@email.com520400005303986540${dados.valor.toFixed(2).replace('.', '')}5802BR5913${dados.nomePagador.toUpperCase()}6008SAO PAULO62070503***6304`;
    setPixCode(codigoSimulado);
  }, [dados]);

  // Countdown timer
  useEffect(() => {
    if (statusPagamento !== 'aguardando') return;

    const timer = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          setStatusPagamento('expirado');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [statusPagamento]);

  // Formatar tempo
  function formatarTempo(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Copiar código PIX
  async function copiarCodigo() {
    await navigator.clipboard.writeText(pixCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  // Simular pagamento
  async function simularPagamento() {
    setProcessando(true);
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    switch (modoSimulacao) {
      case 'sucesso':
        setStatusPagamento('pago');
        break;
      case 'falha':
        setStatusPagamento('falhou');
        break;
      case 'pendente':
        setStatusPagamento('aguardando');
        alert('Pagamento pendente de confirmação. Aguarde...');
        break;
      case 'expirado':
        setStatusPagamento('expirado');
        break;
    }

    setProcessando(false);
  }

  // Resetar simulação
  function resetarSimulacao() {
    setStatusPagamento('aguardando');
    setTempoRestante(1800);
    setModoSimulacao('sucesso');
  }

  return (
    <div className="page">
      <div className="page__inner" style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        
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
              marginBottom: 20,
            }}
          >
            ← Voltar ao Dashboard
          </Link>

          <div style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            borderRadius: 12,
            padding: '20px 24px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 32 }}>🧪</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                Simulação de Pagamento
              </h1>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.95 }}>
                Ambiente de teste - Nenhum pagamento real será processado
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Simulação */}
        <div style={{
          background: '#fff',
          border: '2px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
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
            ⚙️ Configurar Simulação
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              Selecione o resultado desejado:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'sucesso', label: '✅ Pagamento Aprovado', color: '#10b981' },
                { key: 'falha', label: '❌ Pagamento Recusado', color: '#ef4444' },
                { key: 'pendente', label: '⏳ Aguardando', color: '#f59e0b' },
                { key: 'expirado', label: '⌛ QR Code Expirado', color: '#6b7280' },
              ].map(opcao => (
                <button
                  key={opcao.key}
                  onClick={() => setModoSimulacao(opcao.key as any)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: `2px solid ${modoSimulacao === opcao.key ? opcao.color : 'var(--border)'}`,
                    background: modoSimulacao === opcao.key ? `${opcao.color}15` : '#fff',
                    color: modoSimulacao === opcao.key ? opcao.color : 'var(--text)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--brown)',
          }}>
            📋 Resumo do Pedido
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pedido #</span>
              <span style={{ fontWeight: 600 }}>{dados.pedidoId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Descrição</span>
              <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 300 }}>{dados.descricao}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pagador</span>
              <span style={{ fontWeight: 600 }}>{dados.nomePagador}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Email</span>
              <span style={{ fontWeight: 600 }}>{dados.emailPagador}</span>
            </div>
          </div>

          <div style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: '2px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--brown)' }}>Total a Pagar</span>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--brown)', fontFamily: 'var(--font-heading)' }}>
              R$ {dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Status do Pagamento */}
        {statusPagamento === 'aguardando' && (
          <div style={{
            background: '#fff',
            border: '2px dashed var(--brown-light)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            marginBottom: 24,
          }}>
            {/* Timer */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fef3c7',
              color: '#92400e',
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 24,
            }}>
              ⏱️ Tempo restante: {formatarTempo(tempoRestante)}
            </div>

            {/* QR Code Placeholder */}
            <div style={{
              width: 220,
              height: 220,
              background: '#f9fafb',
              border: '2px solid var(--border)',
              borderRadius: 12,
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 80,
            }}>
              📱
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: 'var(--brown)' }}>
              Escaneie o QR Code ou use o PIX Copia e Cola
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: 13, color: 'var(--text-muted)' }}>
              O código expira em 30 minutos
            </p>

            {/* Código PIX */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: 10,
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              color: 'var(--text-mid)',
              marginBottom: 16,
              maxHeight: 80,
              overflow: 'auto',
              textAlign: 'left',
            }}>
              {pixCode}
            </div>

            <button
              onClick={copiarCodigo}
              style={{
                padding: '12px 24px',
                background: copiado ? '#10b981' : 'var(--brown-light)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 24,
                transition: 'background 0.3s',
              }}
            >
              {copiado ? '✅ Código copiado!' : '📋 Copiar código PIX'}
            </button>

            {/* Botão de Simular Pagamento */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                ou simule o pagamento:
              </p>
              <button
                onClick={simularPagamento}
                disabled={processando}
                style={{
                  padding: '14px 32px',
                  background: 'var(--brown)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: processando ? 'not-allowed' : 'pointer',
                  opacity: processando ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {processando ? (
                  <>⏳ Processando...</>
                ) : (
                  <>💳 Simular Pagamento</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Pagamento Aprovado */}
        {statusPagamento === 'pago' && (
          <div style={{
            background: '#fff',
            border: '2px solid #10b981',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
          }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              margin: '0 auto 24px',
            }}>
              ✅
            </div>
            
            <h2 style={{ margin: '0 0 12px 0', fontSize: 24, fontWeight: 700, color: '#166534' }}>
              Pagamento Aprovado!
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--text-muted)' }}>
              Seu pagamento foi processado com sucesso.<br />
              O pedido #{dados.pedidoId} foi confirmado.
            </p>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              fontSize: 13,
              color: '#166534',
            }}>
              <strong>✓ Transação ID:</strong> {Math.random().toString(36).substr(2, 9).toUpperCase()}<br />
              <strong>✓ Valor:</strong> R$ {dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br />
              <strong>✓ Data:</strong> {new Date().toLocaleString('pt-BR')}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                to="/dashboard"
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600 }}
              >
                Ver Pedido
              </Link>
              <button
                onClick={resetarSimulacao}
                className="btn-ghost"
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '2px solid var(--border)',
                }}
              >
                Nova Simulação
              </button>
            </div>
          </div>
        )}

        {/* Pagamento Falhou */}
        {statusPagamento === 'falhou' && (
          <div style={{
            background: '#fff',
            border: '2px solid #ef4444',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
          }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              margin: '0 auto 24px',
            }}>
              ❌
            </div>
            
            <h2 style={{ margin: '0 0 12px 0', fontSize: 24, fontWeight: 700, color: '#991b1b' }}>
              Pagamento Não Aprovado
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--text-muted)' }}>
              Infelizmente não foi possível processar seu pagamento.<br />
              Tente novamente ou escolha outra forma de pagamento.
            </p>

            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              fontSize: 13,
              color: '#991b1b',
            }}>
              <strong>Motivo:</strong> Saldo insuficiente<br />
              <strong>Tentativa:</strong> {new Date().toLocaleString('pt-BR')}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={resetarSimulacao}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600 }}
              >
                Tentar Novamente
              </button>
              <Link
                to="/dashboard"
                className="btn-ghost"
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  border: '2px solid var(--border)',
                }}
              >
                Cancelar
              </Link>
            </div>
          </div>
        )}

        {/* Pagamento Expirado */}
        {statusPagamento === 'expirado' && (
          <div style={{
            background: '#fff',
            border: '2px solid #6b7280',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
          }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              margin: '0 auto 24px',
            }}>
              ⌛
            </div>
            
            <h2 style={{ margin: '0 0 12px 0', fontSize: 24, fontWeight: 700, color: '#374151' }}>
              QR Code Expirado
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--text-muted)' }}>
              O tempo para pagamento expirou.<br />
              Gere um novo código PIX para continuar.
            </p>

            <button
              onClick={resetarSimulacao}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600 }}
            >
              Gerar Novo Código
            </button>
          </div>
        )}

        {/* Informações de Teste */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#1e40af' }}>
            📖 Como usar esta simulação:
          </h4>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#1e40af', lineHeight: 1.8 }}>
            <li>Selecione o resultado desejado (sucesso, falha, pendente ou expirado)</li>
            <li>Clique em "Simular Pagamento" para testar o fluxo</li>
            <li>Observe como o sistema responde a cada cenário</li>
            <li>Use "Nova Simulação" para testar outros cenários</li>
          </ol>
          <p style={{ margin: '12px 0 0 0', fontSize: 12, color: '#1e40af', fontStyle: 'italic' }}>
            💡 Dica: Você também pode esperar o timer expirar para testar o cenário de QR code expirado.
          </p>
        </div>
      </div>
    </div>
  );
}
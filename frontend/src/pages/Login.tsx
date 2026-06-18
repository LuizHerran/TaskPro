import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !senha.trim()) {
      setError('⚠️ Preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const { user } = await authApi.login(email, senha);
      localStorage.setItem('taskpro_user', JSON.stringify(user));
      const from = (location.state as any)?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch {
      setError('❌ Email ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Função para preencher credenciais de teste
  function preencherTeste() {
    setEmail('roberto@taskpro.com');
    setSenha('123456');
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480, padding: '48px 40px' }}>
        
        {/* Logo */}
        <Link to="/" className="logo" style={{ display: 'inline-block', marginBottom: 32 }}>
          <span>Task</span><span>Pro</span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            👋
          </div>
          <h1 className="auth-card__title" style={{ marginBottom: 8 }}>
            Bem-vindo de volta!
          </h1>
          <p className="auth-card__subtitle" style={{ fontSize: 14 }}>
            Entre com sua conta para acessar o painel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 500,
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Email */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">
              📧 Email
            </label>
            <input
              className="form-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Senha */}
          <div className="form-group" style={{ marginBottom: 12 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <label className="form-label" style={{ margin: 0 }}>
                🔒 Senha
              </label>
              <Link
                to="/esqueci-senha"
                style={{
                  fontSize: 12,
                  color: 'var(--brown-light)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: 0,
                  lineHeight: 1,
                }}
                tabIndex={-1}
              >
                {showPassword ? '👀' : '🙈'}
              </button>
            </div>
          </div>

          {/* Botão Submit */}
          <button
            className="btn-full"
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 700,
              marginTop: 8,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>⏳ Entrando...</>
            ) : (
              <>🚀 Entrar</>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '28px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            OU
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Botão de Teste Rápido */}
        <button
          type="button"
          onClick={preencherTeste}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 8,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#dbeafe';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#eff6ff';
          }}
        >
          🧪 Preencher com conta de teste
        </button>

        {/* Credenciais de teste */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: 12,
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--brown)' }}>Credenciais de Teste:</strong><br />
          <span style={{ fontFamily: 'monospace' }}>roberto@taskpro.com</span> / <span style={{ fontFamily: 'monospace' }}>123456</span>
        </div>

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: 28 }}>
          Não tem conta? <Link to="/cadastro" style={{ fontWeight: 600 }}>Cadastre-se grátis</Link>
        </div>

        {/* Termos */}
        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginTop: 20,
          lineHeight: 1.5,
        }}>
          Ao entrar, você concorda com nossos{' '}
          <Link to="/termos" style={{ color: 'var(--brown-light)' }}>Termos de Uso</Link> e{' '}
          <Link to="/privacidade" style={{ color: 'var(--brown-light)' }}>Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}
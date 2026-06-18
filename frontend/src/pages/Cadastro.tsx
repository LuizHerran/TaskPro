import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';
import EstadoCidadeSelect from '../components/EstadoCidadeSelect';

export default function Cadastro() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: params.get('tipo') ?? 'CLIENTE',
    telefone: '',
    cidade: '',
    estado: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [erros, setErros] = useState<Erros>({});

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function formatarTelefone(value: string): string {
    const numeros = value.replace(/\D/g, '');
    const limitado = numeros.slice(0, 11);
    
    if (limitado.length <= 10) {
      return limitado
        .replace(/^(\d{2})/, '($1) ')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return limitado
        .replace(/^(\d{2})/, '($1) ')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  }

  // Força da senha
  function calcularForcaSenha(senha: string): { forca: number; texto: string; cor: string } {
    let forca = 0;
    if (senha.length >= 6) forca++;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;

    if (forca <= 2) return { forca, texto: 'Fraca', cor: '#dc2626' };
    if (forca <= 3) return { forca, texto: 'Média', cor: '#f59e0b' };
    if (forca <= 4) return { forca, texto: 'Forte', cor: '#10b981' };
    return { forca, texto: 'Muito forte', cor: '#059669' };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const telefoneNumeros = form.telefone.replace(/\D/g, '');
    
    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
      setError('⚠️ Telefone inválido. Use DDD + número (10 ou 11 dígitos).');
      setLoading(false);
      return;
    }

    if (form.senha.length < 6) {
      setError('⚠️ A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }
    
    if (form.senha !== form.confirmarSenha) {
      setError('⚠️ As senhas não coincidem.');
      setLoading(false);
      return;
    }
    
    if (form.estado.length !== 2) {
      setError('⚠️ Informe o estado com 2 letras (ex: SP).');
      setLoading(false);
      return;
    }

    try {
      const { confirmarSenha, ...payload } = form;
      const { user } = await authApi.cadastro(payload);
      localStorage.setItem('taskpro_user', JSON.stringify(user));
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error;
      setError(msg ?? '❌ Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const forcaSenha = calcularForcaSenha(form.senha);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 640, padding: '40px 36px' }}>
        
        {/* Logo */}
        <Link to="/" className="logo" style={{ display: 'inline-block', marginBottom: 28 }}>
          <span>Task</span><span>Pro</span>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="auth-card__title" style={{ marginBottom: 8 }}>
            Crie sua conta gratuita
          </h1>
          <p className="auth-card__subtitle" style={{ fontSize: 14 }}>
            Junte-se à maior rede de marcenaria do Brasil
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
          
          {/* Tipo de conta - Cards visuais */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>
              Qual é o seu objetivo? *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              
              {/* Cliente */}
              <div
                onClick={() => set('tipo', 'CLIENTE')}
                style={{
                  padding: '18px 16px',
                  border: `2px solid ${form.tipo === 'CLIENTE' ? 'var(--brown-light)' : 'var(--border)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: form.tipo === 'CLIENTE' ? '#fef3c7' : '#fff',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: form.tipo === 'CLIENTE' ? 'var(--brown)' : 'var(--text-muted)',
                  marginBottom: 4,
                }}>
                  Cliente
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quero contratar serviços
                </div>
              </div>

              {/* Marceneiro */}
              <div
                onClick={() => set('tipo', 'MARCENEIRO')}
                style={{
                  padding: '18px 16px',
                  border: `2px solid ${form.tipo === 'MARCENEIRO' ? 'var(--brown-light)' : 'var(--border)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: form.tipo === 'MARCENEIRO' ? '#fef3c7' : '#fff',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>👷</div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: form.tipo === 'MARCENEIRO' ? 'var(--brown)' : 'var(--text-muted)',
                  marginBottom: 4,
                }}>
                  Marceneiro
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quero oferecer serviços
                </div>
              </div>
            </div>
          </div>

          {/* Nome e Telefone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">
                👤 Nome completo *
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="João Silva"
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                📱 Telefone *
              </label>
              <input
                className="form-input"
                type="tel"
                placeholder="(11) 99999-0000"
                value={form.telefone}
                onChange={e => set('telefone', formatarTelefone(e.target.value))}
                maxLength={15}
                required
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {form.telefone.replace(/\D/g, '').length}/11 dígitos
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">
              📧 Email *
            </label>
            <input
              className="form-input"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>

          {/* Senha e Confirmar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">
                🔒 Senha *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha}
                  onChange={e => set('senha', e.target.value)}
                  minLength={6}
                  required
                  style={{ paddingRight: 40 }}
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
                    fontSize: 16,
                    padding: 0,
                  }}
                >
                  {showPassword ? '👀' : '🙈'}
                </button>
              </div>
              {/* Indicador de força da senha */}
              {form.senha && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: i <= forcaSenha.forca ? forcaSenha.cor : '#e5e7eb',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: forcaSenha.cor, fontWeight: 600 }}>
                    {forcaSenha.texto}
                  </span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                🔒 Confirmar Senha *
              </label>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={form.confirmarSenha}
                onChange={e => set('confirmarSenha', e.target.value)}
                minLength={6}
                required
              />
              {/* Indicador de match */}
              {form.confirmarSenha && (
                <span style={{
                  fontSize: 11,
                  marginTop: 4,
                  display: 'block',
                  color: form.senha === form.confirmarSenha ? '#10b981' : '#dc2626',
                  fontWeight: 600,
                }}>
                  {form.senha === form.confirmarSenha ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                </span>
              )}
            </div>
          </div>

          {/* Cidade e Estado */}
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
            }}
          >
            {loading ? '⏳ Criando conta...' : '✨ Criar conta grátis'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: 28 }}>
          Já tem conta? <Link to="/login" style={{ fontWeight: 600 }}>Entrar agora</Link>
        </div>

        {/* Termos */}
        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginTop: 20,
          lineHeight: 1.5,
        }}>
          Ao criar uma conta, você concorda com nossos{' '}
          <Link to="/termos" style={{ color: 'var(--brown-light)' }}>Termos de Uso</Link> e{' '}
          <Link to="/privacidade" style={{ color: 'var(--brown-light)' }}>Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}
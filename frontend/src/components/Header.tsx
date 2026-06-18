import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('taskpro_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  function handleLogout() {
    localStorage.removeItem('taskpro_user');
    navigate('/');
    window.location.reload();
  }

  return (
    <header className="header">
      <div className="header__inner">
        <nav className="header__nav">
          <Link to="/" className="logo">
            <span>Task</span><span>Pro</span>
          </Link>
          <Link to="/marceneiros" className="nav-link">Marceneiros</Link>
          <Link to="/#como-funciona" className="nav-link">Como Funciona</Link>
        </nav>

        <div className="header__actions">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Olá, {user.nome.split(' ')[0]}
              </Link>
              <button className="btn-ghost" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Entrar</Link>
              <Link to="/cadastro?tipo=MARCENEIRO" className="btn-primary">
                Sou Marceneiro
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

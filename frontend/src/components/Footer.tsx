import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <div className="footer__brand-name">TaskPro</div>
          <p className="footer__brand-desc">
            A maior rede de marceneiros qualificados do Brasil. Qualidade,
            precisão e confiança em cada projeto.
          </p>
        </div>

        <div>
          <div className="footer__col-title">Plataforma</div>
          <div className="footer__links">
            <Link to="/" className="footer__link">Sobre Nós</Link>
            <Link to="/marceneiros" className="footer__link">Categorias</Link>
            <Link to="/#como-funciona" className="footer__link">Como Funciona</Link>
          </div>
        </div>

        <div>
          <div className="footer__col-title">Suporte</div>
          <div className="footer__links">
            <span className="footer__link">Termos de Uso</span>
            <span className="footer__link">Privacidade</span>
          </div>
        </div>

        <div>
          <div className="footer__col-title">Redes Sociais</div>
          <div className="footer__social">
            <span className="footer__social-icon">📘</span>
            <span className="footer__social-icon">📸</span>
            <span className="footer__social-icon">🐦</span>
          </div>
          <div className="footer__link" style={{ marginBottom: 8 }}>
            (xx) x xxxx-xxxx
          </div>
          <div className="footer__link">contato@taskpro.com</div>
        </div>
      </div>

      <p className="footer__copy">
        © 2026 TaskPro – O Digital Joinery. Todos os direitos reservados.
      </p>
    </footer>
  );
}

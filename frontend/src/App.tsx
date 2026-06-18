import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marceneiros from './pages/Marceneiros';
import MarceneiroDetalhe from './pages/MarceneiroDetalhe';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Chat from './pages/Chat';
import MeusAnuncios from './pages/MeusAnuncios';
import Agenda from './pages/Agenda';
import Favoritos from './pages/Favoritos';
import Contratar from './pages/Contratar';
import SimulacaoPagamento from './pages/SimulacaoPagamento';


export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/"                   element={<Home />} />
        <Route path="/marceneiros"        element={<Marceneiros />} />
        <Route path="/marceneiros/:id"    element={<MarceneiroDetalhe />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/chat/:id"           element={<Chat />} />
        <Route path="/cadastro"           element={<Cadastro />} />
        <Route path="/dashboard"          element={<Dashboard />} />
        <Route path="/perfil"                    element={<Perfil />} />
        <Route path="/meus-anuncios"             element={<MeusAnuncios />} />
        <Route path="/agenda"                    element={<Agenda />} />
        <Route path="/favoritos"                 element={<Favoritos />} />
        <Route path="/contratar/:servicoId"      element={<Contratar />} />
        <Route path="/simulacao-pagamento"        element={<SimulacaoPagamento />} />
      </Routes>
      <Footer />
    </>
  );
}

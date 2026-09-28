import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import RutaPrivada from './components/RutaPrivada';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import NavbarTabs from './components/NavbarTabs/NavbarTabs';
import Home from './pages/Home/Home';
import Recetas from './pages/Recetas/Recetas';
import RecetaDetalle from './pages/RecetaDetalle/RecetaDetalle';
import NuevaReceta from './pages/NuevaReceta/NuevaReceta';
import EditarReceta from './pages/EditarReceta/EditarReceta';
import Alimentos from './pages/Alimentos/Alimentos';
import Perfil from './pages/Perfil/Perfil';
import Login from './pages/Login/Login';
import Registro from './pages/Registro/Registro';
import MenuSemanal from './pages/MenuSemanal/MenuSemanal';
import NotFound from './pages/NotFound/NotFound';
// Página "Cómo funciona" desactivada por ahora. Para recuperarla, descomenta el import y la ruta.
// import ComoFunciona from './pages/ComoFunciona/ComoFunciona';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* El listado de recetas solo está disponible con sesión iniciada */}
              <Route path="/recetas" element={<RutaPrivada><Recetas /></RutaPrivada>} />
              <Route path="/recetas/nueva" element={<RutaPrivada><NuevaReceta /></RutaPrivada>} />
              <Route path="/receta/:id" element={<RecetaDetalle />} />
              <Route path="/receta/:id/editar" element={<RutaPrivada><EditarReceta /></RutaPrivada>} />
              <Route path="/alimentos" element={<Alimentos />} />
              <Route path="/perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />
              <Route path="/usuarios/:id" element={<Perfil />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/menu-semanal" element={<MenuSemanal />} />
              {/* <Route path="/como-funciona" element={<ComoFunciona />} /> */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
          <NavbarTabs />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

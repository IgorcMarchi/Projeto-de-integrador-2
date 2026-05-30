// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './api/supabaseClient';

import TopBar           from './components/layout/TopBar';
import BottomNav        from './components/layout/BottomNav';
import RotaProtegida    from './components/RotaProtegida';
import SplashScreen     from './components/SplashScreen';

import LoginPage        from './pages/LoginPage';
import HomePage         from './pages/HomePage';
import EventosPage      from './pages/EventosPage';
import HorariosPage     from './pages/HorariosPage';
import PerfilPage       from './pages/PerfilPage';
import NotificacoesPage from './pages/NotificacoesPage';
import ReportarPage     from './pages/ReportarPage';
import SugestoesPage    from './pages/SugestoesPage';
import NotFoundPage     from './pages/NotFoundPage';

export default function App() {
  const [usuario, setUsuario]       = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    // Verifica se já tem sessão ativa ao abrir o app
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null);
      setVerificando(false);
    });

    // Fica escutando login/logout em tempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (verificando) return <SplashScreen />;

  return (
    <BrowserRouter>
      <Routes>

        {/* Rota de login — sem TopBar e BottomNav */}
        <Route path="/login" element={<LoginPage />} />

        {/* Todas as outras rotas com o layout normal */}
        <Route path="/*" element={
          <>
            <TopBar usuario={usuario} />
            <Routes>
              <Route path="/"         element={<HomePage />} />
              <Route path="/eventos"  element={<EventosPage />} />
              <Route path="/horarios" element={<HorariosPage />} />
              <Route path="/perfil"   element={<PerfilPage />} />

              {/* Rotas protegidas — exigem login */}
              <Route element={<RotaProtegida usuario={usuario} verificando={verificando} />}>
                <Route path="/notificacoes" element={<NotificacoesPage />} />
                <Route path="/reportar"     element={<ReportarPage />} />
                <Route path="/sugestoes"    element={<SugestoesPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <BottomNav />
          </>
        } />

      </Routes>
    </BrowserRouter>
  );
}

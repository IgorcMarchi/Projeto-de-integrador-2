// src/components/RotaProtegida.jsx
// Redireciona para /login se o usuário não estiver autenticado.
// Guarda a rota original em state.de para redirecionar após o login.

import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RotaProtegida({ usuario, verificando }) {
  const location = useLocation();

  if (verificando) return null;

  if (!usuario) {
    return <Navigate to="/login" state={{ de: location.pathname }} replace />;
  }

  return <Outlet />;
}

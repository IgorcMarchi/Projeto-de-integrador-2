// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

export function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Pega o usuário logado no momento
    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user);
      setCarregando(false);
    });

    // Fica escutando mudanças de login/logout em tempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUsuario(sessao?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { usuario, carregando };
}
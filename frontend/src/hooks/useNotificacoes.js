// src/hooks/useNotificacoes.js
import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from './useAuth';

export function useNotificacoes() {
  const { usuario } = useAuth();
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    if (!usuario) return;

    // Conta as não lidas na primeira carga
    async function contarNaoLidas() {
      const { count } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', usuario.id)
        .eq('lida', false);

      setNaoLidas(count || 0);
    }

    contarNaoLidas();

    // Fica escutando novas notificações em tempo real (Supabase Realtime)
    const canal = supabase
      .channel('notificacoes_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `user_id=eq.${usuario.id}`,
      }, () => {
        // Chegou notificação nova → incrementa o contador
        setNaoLidas((prev) => prev + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, [usuario]);

  return { naoLidas };
}
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
      // Busca notificações do usuário
      const { count: countUser } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', usuario.id)
        .eq('lida', false);

      // Busca notificações globais não lidas
      const { count: countGlobal } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null)
        .eq('lida', false);

      setNaoLidas((countUser || 0) + (countGlobal || 0));
    }

    contarNaoLidas();

    // Fica escutando novas notificações em tempo real (Supabase Realtime)
    const canal = supabase
      .channel('notificacoes_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `user_id=is.null`,
      }, () => {
        // Notificação global → incrementa o contador
        setNaoLidas((prev) => prev + 1);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `user_id=eq.${usuario.id}`,
      }, () => {
        // Notificação pessoal → incrementa o contador
        setNaoLidas((prev) => prev + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, [usuario]);

  return { naoLidas };
}
// src/components/layout/TopBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { supabase } from '../../api/supabaseClient';

export default function TopBar({ usuario }) {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    if (!usuario) { setNomeUsuario(''); return; }

    supabase
      .from('profiles')
      .select('nome_completo')
      .eq('id', usuario.id)
      .single()
      .then(({ data }) => {
        const primeiroNome = data?.nome_completo?.split(' ')[0]
          ?? usuario.email?.split('@')[0]
          ?? '';
        setNomeUsuario(primeiroNome);
      });
  }, [usuario]);

  // Escuta mudanças no perfil em tempo real
  useEffect(() => {
    if (!usuario) return;

    const subscription = supabase
      .channel(`profiles:${usuario.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${usuario.id}`
      }, (payload) => {
        const novoNome = payload.new.nome_completo?.split(' ')[0] || nomeUsuario;
        setNomeUsuario(novoNome);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [usuario]);

  const irParaPerfil = () => {
    navigate('/perfil');
  };

  return (
    <>
      <header style={styles.header}>
        <button style={styles.botaoIcone} onClick={() => setMenuAberto(true)}>
          ☰
        </button>

        <span style={styles.logo}>Conecta SH</span>

        <button style={styles.botaoUsuario} onClick={irParaPerfil} title="Clique para editar seu perfil">
          👤 {nomeUsuario}
        </button>
      </header>

      <Sidebar aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
    </>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#023e8a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  logo: {
    fontFamily: 'Impact, sans-serif',
    fontSize: 20,
    letterSpacing: 1,
    color: '#00b4d8',
    textShadow: '0 0 10px #0096c7',
  },
  botaoIcone: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: 22,
    cursor: 'pointer',
    padding: 4,
  },
  botaoUsuario: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '4px 8px',
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

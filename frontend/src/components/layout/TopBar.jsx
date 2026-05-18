// src/components/layout/TopBar.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { supabase } from '../../api/supabaseClient';

export default function TopBar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <button style={styles.botaoIcone} onClick={() => setMenuAberto(true)}>
          ☰
        </button>

        <span style={styles.logo}>Conecta SH</span>

        <button style={styles.botaoIcone} onClick={async () => {
          await supabase.auth.signOut();
          // o onAuthStateChange no App.js já lida com o resto
        }}>
          👤
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
};

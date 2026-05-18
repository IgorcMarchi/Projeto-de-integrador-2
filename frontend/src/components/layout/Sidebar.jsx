// src/components/layout/Sidebar.jsx
// -------------------------------------------------------
// Menu lateral deslizante do ConectaSH.
// Baseado no protótipo Figma (Tela 2 / Página 02).
// Recebe as props:
//   - aberto: boolean que controla se o menu está visível
//   - onFechar: função chamada ao clicar fora ou no X
// -------------------------------------------------------

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Itens do menu ─────────────────────────────────────────
const ITENS_MENU = [
  { label: 'INÍCIO',        icone: '🏠', rota: '/'             },
  { label: 'EVENTOS',       icone: '🎫', rota: '/eventos'       },
  { label: 'SUGESTÕES',     icone: '✏️', rota: '/sugestoes'     },
  { label: 'HORÁRIOS',      icone: '⏰', rota: '/horarios'      },
  { label: 'NOTIFICAÇÕES',  icone: '🔔', rota: '/notificacoes'  },
  { label: 'REPORTAR',      icone: '🚩', rota: '/reportar'      },
];

const ITENS_RODAPE = [
  { label: 'CONFIGURAÇÕES', icone: '⚙️', emBreve: true },
  { label: 'SUPORTE',       icone: '🎧', emBreve: true },
];

// ── Componente Principal ──────────────────────────────────
export default function Sidebar({ aberto, onFechar }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  function irPara(rota) {
    navigate(rota);
    onFechar(); // fecha o menu após navegar
  }

  return (
    <>
      {/* Overlay escuro por trás do menu — clicou fora, fecha */}
      {aberto && (
        <div
          onClick={onFechar}
          style={styles.overlay}
        />
      )}

      {/* Painel lateral */}
      <aside
        style={{
          ...styles.painel,
          transform: aberto ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Cabeçalho do sidebar com logo */}
        <div style={styles.cabecalho}>
          <span style={styles.logo}>Conecta SH</span>
          <button style={styles.botaoFechar} onClick={onFechar}>✕</button>
        </div>

        {/* Itens principais */}
        <nav style={styles.nav}>
          {ITENS_MENU.map((item) => {
            const ativo = pathname === item.rota;
            return (
              <button
                key={item.rota}
                onClick={() => irPara(item.rota)}
                style={{
                  ...styles.itemMenu,
                  backgroundColor: ativo ? 'rgba(0, 180, 216, 0.15)' : 'transparent',
                  borderLeft: ativo ? '3px solid #00b4d8' : '3px solid transparent',
                }}
              >
                <span style={styles.itemIcone}>{item.icone}</span>
                <span style={{ ...styles.itemLabel, color: ativo ? '#00b4d8' : '#cbd5e1' }}>
                  {item.label}
                </span>
                {/* Estrela de favorito — visual fiel ao Figma */}
                <span style={styles.estrela}>☆</span>
              </button>
            );
          })}
        </nav>

        {/* Divisor */}
        <div style={styles.divisor} />

        {/* Itens de rodapé: Configurações e Suporte */}
        <nav style={styles.nav}>
          {ITENS_RODAPE.map((item) => (
            <div
              key={item.label}
              style={{ ...styles.itemMenu, borderLeft: '3px solid transparent', opacity: 0.45, cursor: 'default' }}
            >
              <span style={styles.itemIcone}>{item.icone}</span>
              <span style={styles.itemLabel}>{item.label}</span>
              <span style={styles.tagEmBreve}>EM BREVE</span>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

// ── Estilos ───────────────────────────────────────────────
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
  },
  painel: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: 240,
    backgroundColor: '#012a5e',   // azul escuro do ConectaSH
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.25s ease',
    boxShadow: '4px 0 20px rgba(0,0,0,0.4)',
  },
  cabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    fontFamily: 'Impact, sans-serif',
    fontSize: 20,
    letterSpacing: 1,
    color: '#00b4d8',
    textShadow: '0 0 8px #0096c7',
  },
  botaoFechar: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
  },
  itemMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '13px 16px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease',
  },
  itemIcone: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  estrela: {
    fontSize: 14,
    color: '#475569',
  },
  tagEmBreve: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00b4d8',
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    borderRadius: 4,
    padding: '2px 5px',
    letterSpacing: 0.3,
  },
  divisor: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: '4px 16px',
  },
};

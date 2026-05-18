// src/components/layout/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotificacoes } from '../../hooks/useNotificacoes';

const ABAS = [
  { rota: '/horarios',     icone: '⏰', label: 'Horários'    },
  { rota: '/',             icone: '🏠', label: 'Home'        },
  { rota: '/sugestoes',    icone: '✏️', label: 'Sugestões'   },
  { rota: '/reportar',     icone: '🚩', label: 'Reportar'    },
  { rota: '/notificacoes', icone: '🔔', label: 'Notificações'},
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { naoLidas } = useNotificacoes();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: '#023e8a',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 14px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
    }}>
      {ABAS.map((aba) => {
        const ativo = pathname === aba.rota;
        return (
          <button
            key={aba.rota}
            onClick={() => navigate(aba.rota)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: ativo ? '#00b4d8' : 'rgba(255,255,255,0.5)',
              fontSize: ativo ? 26 : 22,
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ position: 'relative', lineHeight: 1 }}>
              <span>{aba.icone}</span>
              {aba.rota === '/notificacoes' && naoLidas > 0 && (
                <span style={styles.badge}>
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </div>
            <span style={{ fontSize: 9, fontWeight: ativo ? '700' : '400' }}>
              {aba.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  badge: {
    position: 'absolute',
    top: -4,
    right: -7,
    backgroundColor: '#ef476f',
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    lineHeight: 1,
    boxSizing: 'border-box',
  },
};
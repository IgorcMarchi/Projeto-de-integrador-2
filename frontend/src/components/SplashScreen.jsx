// src/components/SplashScreen.jsx
// Exibida enquanto o app verifica a sessão do usuário.

import React from 'react';

const CSS = `
  @keyframes conecta-pulsar {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(0.96); }
  }
  @keyframes conecta-ponto {
    0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
    40%           { transform: scale(1);   opacity: 1; }
  }
  .splash-logo { animation: conecta-pulsar 2s ease-in-out infinite; }
  .splash-ponto { display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background: #00b4d8; margin: 0 4px; animation: conecta-ponto 1.3s ease-in-out infinite; }
`;

export default function SplashScreen() {
  return (
    <>
      <style>{CSS}</style>
      <div style={styles.tela}>
        <div className="splash-logo" style={styles.logoBox}>
          <span style={styles.logoTexto}>Conecta SH</span>
          <span style={styles.logoSub}>Santa Helena · PR</span>
        </div>
        <div style={styles.pontos}>
          <span className="splash-ponto" style={{ animationDelay: '0s' }} />
          <span className="splash-ponto" style={{ animationDelay: '0.2s' }} />
          <span className="splash-ponto" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </>
  );
}

const styles = {
  tela: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#012a5e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    zIndex: 999,
  },
  logoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  logoTexto: {
    fontFamily: 'Impact, sans-serif',
    fontSize: 42,
    letterSpacing: 2,
    color: '#00b4d8',
    textShadow: '0 0 24px rgba(0, 180, 216, 0.6)',
  },
  logoSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  pontos: {
    display: 'flex',
    alignItems: 'center',
  },
};

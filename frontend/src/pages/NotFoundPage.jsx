// src/pages/NotFoundPage.jsx
// Exibida quando o usuário acessa uma rota inexistente.

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.pagina}>
      <span style={styles.codigo}>404</span>
      <h1 style={styles.titulo}>PÁGINA NÃO ENCONTRADA</h1>
      <p style={styles.descricao}>
        O endereço que você digitou não existe no ConectaSH.
      </p>
      <button style={styles.botao} onClick={() => navigate('/')}>
        VOLTAR PARA O INÍCIO
      </button>
    </div>
  );
}

const styles = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '0 32px',
    paddingBottom: 80,
    textAlign: 'center',
  },
  codigo: {
    fontFamily: 'Impact, sans-serif',
    fontSize: 96,
    color: '#00b4d8',
    textShadow: '2px 2px 0 #0077b6',
    lineHeight: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#023e8a',
    letterSpacing: 1,
    margin: '8px 0 0',
    fontFamily: 'Impact, sans-serif',
  },
  descricao: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
    margin: '4px 0 20px',
    maxWidth: 280,
  },
  botao: {
    padding: '14px 28px',
    backgroundColor: '#023e8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: 0.5,
  },
};

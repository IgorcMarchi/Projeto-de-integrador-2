// src/pages/NotificacoesPage.jsx
// -------------------------------------------------------
// Tela "Notificações" do ConectaSH.
// Baseada no protótipo Figma (Tela 5 / Página 05).
// Se não estiver logado, redireciona para /login.
// -------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { buscarNotificacoes, marcarComoLida } from '../api/supabaseService';

// ── Dados mock (fallback) ─────────────────────────────────
const NOTIFICACOES_MOCK = [
  {
    id: 1,
    tipo: 'evento',
    titulo: 'Compra concluída – Evento',
    mensagem: 'Você comprou o ingresso do Show Expo SH.',
    lida: false,
    imagem_url: null,
    criado_em: new Date().toISOString(),
  },
  {
    id: 2,
    tipo: 'reporte',
    titulo: 'Reportado quiosque com problema',
    mensagem: 'Você reportou o quiosque 61 da manutenção.',
    lida: true,
    imagem_url: null,
    criado_em: new Date().toISOString(),
  },
  {
    id: 3,
    tipo: 'evento',
    titulo: 'Novo Evento – Pré Carnaval',
    mensagem: 'Show do Pré Carnaval em Santa Helena estará acontecendo.',
    lida: false,
    imagem_url: null,
    criado_em: new Date().toISOString(),
  },
  {
    id: 4,
    tipo: 'evento',
    titulo: 'Novo Evento – Show Expo SH',
    mensagem: 'Show Expo Santa Helena estará acontecendo em breve!',
    lida: false,
    imagem_url: null,
    criado_em: new Date().toISOString(),
  },
];

// ── Cores e ícones por tipo ───────────────────────────────
const CONFIG_TIPO = {
  evento:  { cor: '#0096c7', fundo: '#e0f4ff', icone: '🎫' },
  reporte: { cor: '#ef476f', fundo: '#ffeef2', icone: '🚩' },
  sistema: { cor: '#06d6a0', fundo: '#e0fff7', icone: '🔔' },
};

// ── Formata data para "há X min / h / dias" ───────────────
function tempoRelativo(dataISO) {
  const diff = Date.now() - new Date(dataISO).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `há ${min || 1} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)} dias`;
}

// ── Card de notificação ───────────────────────────────────
function CardNotificacao({ notif, onDetalhes }) {
  const cfg = CONFIG_TIPO[notif.tipo] || CONFIG_TIPO.sistema;

  return (
    <div style={{ ...styles.card, opacity: notif.lida ? 0.65 : 1 }}>
      <div style={{ ...styles.barraLateral, backgroundColor: cfg.cor }} />
      <div style={styles.cardConteudo}>
        <div style={styles.cardTopo}>
          <div style={styles.cardTituloCont}>
            <span style={{ ...styles.badgeTipo, backgroundColor: cfg.fundo, color: cfg.cor }}>
              {cfg.icone} {notif.tipo?.toUpperCase()}
            </span>
            <p style={styles.cardTitulo}>{notif.titulo}</p>
          </div>
          <div style={{ ...styles.cardImagem, backgroundColor: cfg.fundo }}>
            <span style={{ fontSize: 22 }}>{cfg.icone}</span>
          </div>
        </div>
        <p style={styles.cardMensagem}>{notif.mensagem}</p>
        <div style={styles.cardRodape}>
          <span style={styles.cardTempo}>{tempoRelativo(notif.criado_em)}</span>
          <button style={styles.botaoDetalhes} onClick={() => onDetalhes(notif)}>
            DETALHES ⓘ
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────
export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando]     = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarNotificacoes();
        setNotificacoes(dados || []);
      } catch {
        setNotificacoes([]);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // Clicou em "Detalhes": marca como lida no banco e atualiza o estado local
  async function handleDetalhes(notif) {
    if (!notif.lida) {
      await marcarComoLida(notif.id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, lida: true } : n))
      );
    }
    alert(`Detalhes: ${notif.titulo}\n\n${notif.mensagem}`);
  }

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div style={styles.pagina}>
      <h1 style={styles.titulo}>NOTIFICAÇÕES</h1>

      {naoLidas > 0 && (
        <p style={styles.naoLidasTexto}>
          {naoLidas} nova{naoLidas > 1 ? 's' : ''} notificaç{naoLidas > 1 ? 'ões' : 'ão'}
        </p>
      )}

      {carregando ? (
        <p style={styles.loading}>Carregando notificações...</p>
      ) : notificacoes.length === 0 ? (
        <div style={styles.vazio}>
          <span style={{ fontSize: 48 }}>🔔</span>
          <p style={styles.vazioTitulo}>Você não tem notificações no momento</p>
          <p style={styles.vazioSubtitulo}>Volte mais tarde para verificar novidades!</p>
        </div>
      ) : (
        <div style={styles.lista}>
          {notificacoes.map((n) => (
            <CardNotificacao key={n.id} notif={n} onDetalhes={handleDetalhes} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────
const styles = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    paddingBottom: 80,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00b4d8',
    textShadow: '1px 1px 0 #0077b6',
    letterSpacing: 2,
    padding: '20px 0 6px',
    margin: 0,
    fontFamily: 'Impact, sans-serif',
  },
  naoLidasTexto: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ef476f',
    fontWeight: '600',
    margin: '0 0 8px',
  },
  lista: {
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'row',
  },
  barraLateral: {
    width: 5,
    flexShrink: 0,
  },
  cardConteudo: {
    flex: 1,
    padding: '10px 12px',
  },
  cardTopo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTituloCont: {
    flex: 1,
  },
  badgeTipo: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: '700',
    borderRadius: 4,
    padding: '2px 6px',
    marginBottom: 4,
  },
  cardTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    lineHeight: 1.3,
  },
  cardImagem: {
    width: 48,
    height: 48,
    borderRadius: 8,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMensagem: {
    fontSize: 12,
    color: '#64748b',
    margin: '6px 0 8px',
    lineHeight: 1.4,
  },
  cardRodape: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTempo: {
    fontSize: 11,
    color: '#94a3b8',
  },
  botaoDetalhes: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#0096c7',
    border: 'none',
    borderRadius: 6,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
  vazio: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginTop: 60,
    color: '#94a3b8',
    fontSize: 14,
  },
  vazioTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  vazioSubtitulo: {
    fontSize: 13,
    color: '#94a3b8',
    margin: 0,
  },
};

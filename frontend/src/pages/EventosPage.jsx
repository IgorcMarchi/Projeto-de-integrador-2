// src/pages/EventosPage.jsx
// -------------------------------------------------------
// Tela "Eventos" do ConectaSH.
// Baseada no protótipo Figma (Tela 3 / Página 03).
// Lista cards de eventos com data, horário e botão Detalhes.
// Busca dados do Supabase; usa fallback para o MVP.
// -------------------------------------------------------

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { buscarEventos } from '../api/supabaseService';

// ── Dados de fallback ─────────────────────────────────────
const EVENTOS_FALLBACK = [
  {
    id: 1,
    titulo: 'Show Expo SH',
    data: '20/05/2026',
    horario: '14:00h às 17:00h',
    descricao: 'Grande show da Expo Santa Helena com atrações regionais.',
    categoria: 'show',
    imagem_url: null,
  },
  {
    id: 2,
    titulo: 'Show Pré-Carnaval SH',
    data: '25/02/2026',
    horario: '16:00h às 17:00h',
    descricao: 'Festa de pré-carnaval com bandas locais na Prainha.',
    categoria: 'festival',
    imagem_url: null,
  },
];

// ── Configuração visual por categoria ─────────────────────
const CONFIG_CATEGORIA = {
  show:     { cor: '#0096c7', fundo: '#e0f4ff', icone: '🎤' },
  festival: { cor: '#f77f00', fundo: '#fff3e0', icone: '🎉' },
  esporte:  { cor: '#06d6a0', fundo: '#e0fff7', icone: '⚽' },
  cultura:  { cor: '#9b5de5', fundo: '#f3e8ff', icone: '🎨' },
};

// ── Modal simples de detalhes ─────────────────────────────
function ModalDetalhes({ evento, onFechar }) {
  if (!evento) return null;
  const cfg = CONFIG_CATEGORIA[evento.categoria] || CONFIG_CATEGORIA.show;

  return (
    <>
      {/* Overlay */}
      <div onClick={onFechar} style={styles.overlay} />

      {/* Caixa do modal */}
      <div style={styles.modal}>
        {/* Cabeçalho colorido */}
        <div style={{ ...styles.modalHeader, backgroundColor: cfg.cor }}>
          <span style={styles.modalIcone}>{cfg.icone}</span>
          <button style={styles.modalFechar} onClick={onFechar}>✕</button>
        </div>

        <div style={styles.modalCorpo}>
          <p style={styles.modalCategoria}>{evento.categoria?.toUpperCase()}</p>
          <h2 style={styles.modalTitulo}>{evento.titulo}</h2>

          <div style={styles.modalInfoRow}>
            <span>📅</span>
            <span style={styles.modalInfoTexto}>{evento.data}</span>
          </div>
          <div style={styles.modalInfoRow}>
            <span>⏰</span>
            <span style={styles.modalInfoTexto}>{evento.horario}</span>
          </div>

          <p style={styles.modalDescricao}>{evento.descricao}</p>

          <button style={{ ...styles.botaoAcao, backgroundColor: cfg.cor }} onClick={onFechar}>
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}

// ── Card de evento ────────────────────────────────────────
function CardEvento({ evento, onDetalhes }) {
  const cfg = CONFIG_CATEGORIA[evento.categoria] || CONFIG_CATEGORIA.show;

  return (
    <div style={styles.card}>
      {/* Barra colorida no topo do card */}
      <div style={{ ...styles.cardBarraTopo, backgroundColor: cfg.cor }} />

      <div style={styles.cardConteudo}>
        {/* Lado esquerdo: textos */}
        <div style={styles.cardTextos}>
          <p style={styles.cardTitulo}>{evento.titulo}</p>

          <div style={styles.cardInfoRow}>
            <span style={styles.cardInfoIcone}>📅</span>
            <span style={styles.cardInfoTexto}>{evento.data}</span>
          </div>
          <div style={styles.cardInfoRow}>
            <span style={styles.cardInfoIcone}>⏰</span>
            <span style={styles.cardInfoTexto}>{evento.horario}</span>
          </div>

          <button
            style={{ ...styles.botaoDetalhes, backgroundColor: cfg.cor }}
            onClick={() => onDetalhes(evento)}
          >
            DETALHES ⓘ
          </button>
        </div>

        {/* Lado direito: imagem ou emoji */}
        <div style={{ ...styles.cardImagem, backgroundColor: cfg.fundo }}>
          <span style={{ fontSize: 32 }}>{cfg.icone}</span>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────
export default function EventosPage() {
  const { dados: eventos, carregando } = useFetch(buscarEventos, EVENTOS_FALLBACK);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  return (
    <div style={styles.pagina}>
      {/* Cabeçalho */}
      <h1 style={styles.titulo}>EVENTOS</h1>

      {/* Lista de cards */}
      {carregando ? (
        <p style={styles.loading}>Carregando eventos...</p>
      ) : eventos.length === 0 ? (
        <div style={styles.vazio}>
          <span style={{ fontSize: 48 }}>🎫</span>
          <p>Nenhum evento cadastrado ainda.</p>
        </div>
      ) : (
        <div style={styles.lista}>
          {eventos.map((evento) => (
            <CardEvento
              key={evento.id}
              evento={evento}
              onDetalhes={setEventoSelecionado}
            />
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      <ModalDetalhes
        evento={eventoSelecionado}
        onFechar={() => setEventoSelecionado(null)}
      />
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
    padding: '20px 0 10px',
    margin: 0,
    fontFamily: 'Impact, sans-serif',
  },
  lista: {
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  },
  cardBarraTopo: {
    height: 4,
  },
  cardConteudo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 14px',
    gap: 12,
  },
  cardTextos: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px',
  },
  cardInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardInfoIcone: {
    fontSize: 12,
  },
  cardInfoTexto: {
    fontSize: 12,
    color: '#475569',
  },
  botaoDetalhes: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
  },
  cardImagem: {
    width: 64,
    height: 64,
    borderRadius: 10,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 300,
  },
  modal: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: '20px 20px 0 0',
    zIndex: 301,
    overflow: 'hidden',
    maxHeight: '80vh',
  },
  modalHeader: {
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalIcone: {
    fontSize: 36,
  },
  modalFechar: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
  },
  modalCorpo: {
    padding: '20px 24px 32px',
  },
  modalCategoria: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
    margin: '0 0 4px',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 16px',
  },
  modalInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalInfoTexto: {
    fontSize: 14,
    color: '#334155',
  },
  modalDescricao: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.6,
    margin: '16px 0 24px',
  },
  botaoAcao: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
};

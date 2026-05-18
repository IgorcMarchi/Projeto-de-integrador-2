// src/pages/HomePage.jsx
// -------------------------------------------------------
// Tela "Home" do ConectaSH.
// Mapa real MapTiler usando o SDK instalado via npm.
// -------------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { Map, MapStyle, Marker, Popup, config } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { buscarPontosMapa } from '../api/supabaseService';


// ── Coordenadas de Santa Helena – PR ─────────────────────
const SANTA_HELENA = { lng: -54.3308, lat: -24.8596 };

// ── Dados mock ────────────────────────────────────────────
const PONTOS_MOCK = [
  { id: 1, nome: 'Quiosque 01',          tipo: 'quiosque',    latitude: -24.8580, longitude: -54.3290, disponivel: true  },
  { id: 2, nome: 'Quiosque 02',          tipo: 'quiosque',    latitude: -24.8595, longitude: -54.3310, disponivel: false },
  { id: 3, nome: 'Posto de Salvamento',  tipo: 'seguranca',   latitude: -24.8610, longitude: -54.3325, disponivel: true  },
  { id: 4, nome: 'Banheiro Setor A',     tipo: 'banheiro',    latitude: -24.8570, longitude: -54.3300, disponivel: true  },
  { id: 5, nome: 'Praça de Alimentação', tipo: 'alimentacao', latitude: -24.8600, longitude: -54.3280, disponivel: true  },
];

// ── Categorias ────────────────────────────────────────────
const CATEGORIAS = [
  { label: 'Quiosque',     valor: 'quiosque',    cor: '#0096c7' },
  { label: 'Segurança',    valor: 'seguranca',   cor: '#ef476f' },
  { label: 'Banheiro',     valor: 'banheiro',    cor: '#ffd166' },
  { label: 'Alimentação',  valor: 'alimentacao', cor: '#06d6a0' },
];

const EMOJI_CAT = {
  quiosque:    '⛱️',
  seguranca:   '🛟',
  banheiro:    '🚿',
  alimentacao: '🍽️',
};

// ── Componente do Mapa ────────────────────────────────────
function MapaTiler({ pontos, categoriaAtiva, onSelecionarPonto }) {
  const containerRef = useRef(null);
  const mapaRef      = useRef(null);
  const markersRef   = useRef([]);

  // Injeta o CSS do MapTiler no <head> uma única vez
  useEffect(() => {
    const id = 'maptiler-css';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id    = id;
    link.rel   = 'stylesheet';
    link.href  = `https://cdn.maptiler.com/maptiler-sdk-js/v2.4.0/maptiler-sdk.css`;
    document.head.appendChild(link);
  }, []);

  // Inicializa o mapa uma única vez após o CSS carregar
  useEffect(() => {
    if (!containerRef.current || mapaRef.current) return;

    config.apiKey = process.env.REACT_APP_MAPTILER_KEY;

    const mapa = new Map({
      container: containerRef.current,
      style:     MapStyle.STREETS,
      center:    [SANTA_HELENA.lng, SANTA_HELENA.lat],
      zoom:      13,
      attributionControl: false,
    });

    mapaRef.current = mapa;

    mapa.on('load', () => {
      adicionarMarkers(mapa, pontos, categoriaAtiva);
    });

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, []); // roda só uma vez

  // Atualiza markers quando filtro ou pontos mudam
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    if (mapa.loaded()) {
      adicionarMarkers(mapa, pontos, categoriaAtiva);
    } else {
      mapa.once('load', () => adicionarMarkers(mapa, pontos, categoriaAtiva));
    }
  }, [pontos, categoriaAtiva]);

  function adicionarMarkers(mapa, listaPontos, filtro) {
    // Remove markers antigos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filtrados = filtro
      ? listaPontos.filter((p) => p.tipo === filtro)
      : listaPontos;

    filtrados.forEach((ponto) => {
      if (!ponto.latitude || !ponto.longitude) return;

      const cfg = CATEGORIAS.find((c) => c.valor === ponto.tipo);
      const cor = cfg?.cor || '#888';

      // Elemento visual do pin
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          width:32px; height:32px;
          background:${cor};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:2.5px solid white;
          box-shadow:0 3px 8px rgba(0,0,0,0.3);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer;
        ">
          <span style="transform:rotate(45deg);font-size:14px">
            ${EMOJI_CAT[ponto.tipo] || '📍'}
          </span>
        </div>
      `;

      const dispLabel = ponto.disponivel === false ? ' (indisponível)' : '';
      const popup = new Popup({ offset: 30, closeButton: false })
        .setHTML(`
          <div style="font-family:sans-serif;padding:6px 8px;min-width:120px">
            <strong style="font-size:13px;color:#1e293b">${ponto.nome}${dispLabel}</strong>
            <p style="font-size:11px;color:#64748b;margin:4px 0 0">${cfg?.label || ponto.tipo}</p>
          </div>
        `);

      const marker = new Marker({ element: el })
        .setLngLat([ponto.longitude, ponto.latitude])
        .setPopup(popup)
        .addTo(mapa);

      el.addEventListener('click', () => {
        onSelecionarPonto(ponto);
        marker.togglePopup();
      });

      markersRef.current.push(marker);
    });
  }

  return (
    <div style={styles.mapaWrapper}>
      <div ref={containerRef} style={styles.mapaContainer} />
    </div>
  );
}

// ── Card de ponto ─────────────────────────────────────────
function CardPonto({ ponto, selecionado }) {
  const cfg = CATEGORIAS.find((c) => c.valor === ponto.tipo);
  return (
    <div style={{
      ...styles.cardPonto,
      border: selecionado ? `2px solid ${cfg?.cor}` : '2px solid transparent',
      backgroundColor: selecionado ? '#f0faff' : '#ffffff',
    }}>
      <div style={{ ...styles.cardIcone, backgroundColor: (cfg?.cor || '#888') + '22' }}>
        <span style={{ fontSize: 20 }}>{EMOJI_CAT[ponto.tipo] || '📍'}</span>
      </div>
      <div style={styles.cardTexto}>
        <p style={styles.cardNome}>{ponto.nome}</p>
        <p style={styles.cardEndereco}>{cfg?.label || ponto.tipo}{ponto.disponivel === false ? ' · Indisponível' : ''}</p>
      </div>
      <div style={{ ...styles.cardBotaoLoc, borderColor: cfg?.cor || '#0096c7' }}>
        <span style={{ color: cfg?.cor || '#0096c7', fontSize: 18 }}>⊙</span>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────
export default function HomePage() {
  const [pontos, setPontos]                     = useState([]);
  const [carregando, setCarregando]             = useState(true);
  const [categoriaAtiva, setCategoriaAtiva]     = useState(null);
  const [pontoSelecionado, setPontoSelecionado] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarPontosMapa();
        setPontos(dados.length > 0 ? dados : PONTOS_MOCK);
      } catch {
        setPontos(PONTOS_MOCK);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const pontosFiltrados = categoriaAtiva
    ? pontos.filter((p) => p.tipo === categoriaAtiva)
    : pontos;

  return (
    <div style={styles.pagina}>
      <h1 style={styles.titulo}>HOME</h1>

      {/* Mapa */}
      <MapaTiler
        pontos={pontos}
        categoriaAtiva={categoriaAtiva}
        onSelecionarPonto={setPontoSelecionado}
      />

      {/* Filtros */}
      <div style={styles.filtrosContainer}>
        <button style={styles.botaoIncluir}>Incluir ▾</button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.valor}
            onClick={() => setCategoriaAtiva(categoriaAtiva === cat.valor ? null : cat.valor)}
            style={{
              ...styles.chip,
              backgroundColor: categoriaAtiva === cat.valor ? cat.cor : '#e8edf2',
              color:      categoriaAtiva === cat.valor ? '#ffffff' : '#475569',
              fontWeight: categoriaAtiva === cat.valor ? '700' : '400',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {carregando ? (
        <p style={styles.loading}>Carregando pontos...</p>
      ) : (
        <div style={styles.lista}>
          {pontosFiltrados.map((p) => (
            <CardPonto
              key={p.id}
              ponto={p}
              selecionado={pontoSelecionado?.id === p.id}
            />
          ))}
          {pontosFiltrados.length === 0 && (
            <p style={styles.semResultado}>Nenhum ponto nessa categoria.</p>
          )}
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
    padding: '20px 0 8px',
    margin: 0,
    fontFamily: 'Impact, sans-serif',
  },
  mapaWrapper: {
    margin: '0 16px',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
    height: 240,
    position: 'relative',
  },
  mapaContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  filtrosContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    overflowX: 'auto',
  },
  botaoIncluir: {
    flexShrink: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  chip: {
    flexShrink: 0,
    border: 'none',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: 11,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  lista: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardPonto: {
    borderRadius: 10,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    transition: 'all 0.15s ease',
  },
  cardIcone: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTexto: {
    flex: 1,
    overflow: 'hidden',
  },
  cardNome: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardEndereco: {
    fontSize: 11,
    color: '#64748b',
    margin: '2px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardBotaoLoc: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '2px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loading: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 20,
  },
  semResultado: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 20,
  },
};

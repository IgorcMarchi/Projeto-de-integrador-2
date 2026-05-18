// src/pages/HorariosPage.jsx
// -------------------------------------------------------
// Tela "Horários" do ConectaSH.
// Baseada no protótipo Figma (Tela 4 / Página 04).
// Exibe horários de ônibus e coleta de lixo em accordions.
// -------------------------------------------------------

import React, { useState } from 'react';
import { buscarHorarios } from '../api/supabaseService';
import { useFetch } from '../hooks/useFetch';

// ── Dados de fallback (MVP offline) ──────────────────────
// Estrutura espelhando o banco: servico, dia_semana, horario, observacao
const HORARIOS_FALLBACK = [
  {
    id: 1,
    servico: 'Ônibus: Centro -> Prainha',
    dia_semana: 'Sábado e Domingo',
    horario: '09:00:00',
    observacao: 'Saída da rodoviária',
  },
  {
    id: 2,
    servico: 'Ônibus: Prainha -> Centro',
    dia_semana: 'Sábado e Domingo',
    horario: '18:30:00',
    observacao: 'Ponto próximo aos quiosques',
  },
  {
    id: 3,
    servico: 'Coleta de Lixo Seletiva',
    dia_semana: 'Segunda, Quarta e Sexta',
    horario: '07:30:00',
    observacao: 'Lixo reciclável',
  },
  {
    id: 4,
    servico: 'Coleta de Lixo Orgânico',
    dia_semana: 'Terça e Quinta',
    horario: '08:00:00',
    observacao: 'Resíduos comuns',
  },
];

// ── Ícone por nome do serviço ─────────────────────────────
function getIcone(servico = '') {
  const s = servico.toLowerCase();
  if (s.includes('ônibus') || s.includes('onibus') || s.includes('transporte')) return '🚌';
  if (s.includes('orgân') || s.includes('organ')) return '🌿';
  if (s.includes('selet') || s.includes('recicl')) return '♻️';
  return '📋';
}

// ── Formata horário de "HH:MM:SS" para "HH:MM" ───────────
function formatarHorario(horario = '') {
  if (!horario) return '';
  const partes = horario.split(':');
  return `${partes[0]}:${partes[1]}`;
}

// ── Agrupa linhas do banco por nome do serviço (sem duplicatas) ───────────
function agruparPorServico(dados = []) {
  const mapa = {};

  dados.forEach((row) => {
    const chaveServico = row.servico;
    if (!mapa[chaveServico]) {
      mapa[chaveServico] = {
        id: row.id,
        servico: row.servico,
        entradas: [],
        _entradasSet: new Set(), // controle interno de duplicatas
      };
    }

    // Chave única por entrada: servico + dia + horário
    const chaveEntrada = `${row.dia_semana}|${row.horario}`;
    if (!mapa[chaveServico]._entradasSet.has(chaveEntrada)) {
      mapa[chaveServico]._entradasSet.add(chaveEntrada);
      mapa[chaveServico].entradas.push({
        dia_semana: row.dia_semana,
        horario: formatarHorario(row.horario),
        observacao: row.observacao,
      });
    }
  });

  // Remove o Set auxiliar antes de retornar
  return Object.values(mapa).map(({ _entradasSet, ...grupo }) => grupo);
}

// ── Componente Accordion ──────────────────────────────────
function Accordion({ grupo, defaultAberto }) {
  const [aberto, setAberto] = useState(defaultAberto);

  return (
    <div style={styles.accordion}>
      <button
        style={styles.accordionHeader}
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
      >
        <span style={styles.accordionTitulo}>
          <span style={styles.icone}>{getIcone(grupo.servico)}</span>
          {grupo.servico}
        </span>
        <span style={{ ...styles.seta, transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▲
        </span>
      </button>

      {aberto && (
        <div style={styles.accordionBody}>
          {grupo.entradas.map((entrada, i) => (
            <div key={i} style={styles.entradaBox}>
              <div style={styles.entradaLinha}>
                <span style={styles.entradaLabel}>📅 Dia:</span>
                <span style={styles.entradaValor}>{entrada.dia_semana}</span>
              </div>
              <div style={styles.entradaLinha}>
                <span style={styles.entradaLabel}>🕐 Horário:</span>
                <span style={{ ...styles.entradaValor, fontWeight: '700', color: '#0077b6' }}>
                  {entrada.horario}
                </span>
              </div>
              {entrada.observacao && (
                <div style={styles.entradaLinha}>
                  <span style={styles.entradaLabel}>ℹ️ Obs:</span>
                  <span style={styles.entradaValor}>{entrada.observacao}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────
export default function HorariosPage() {
  const { dados: horariosBrutos, carregando } = useFetch(buscarHorarios, HORARIOS_FALLBACK);

  // Agrupa as linhas do banco por nome do serviço
  const grupos = agruparPorServico(horariosBrutos);

  return (
    <div style={styles.pagina}>
      <h1 style={styles.titulo}>HORÁRIOS</h1>

      {carregando ? (
        <p style={styles.loading}>Carregando horários...</p>
      ) : (
        <div style={styles.lista}>
          {grupos.map((grupo, i) => (
            <Accordion key={grupo.servico} grupo={grupo} defaultAberto={i === 0} />
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
    padding: '20px 0 10px',
    margin: 0,
    fontFamily: 'Impact, sans-serif',
  },
  lista: {
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  accordion: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
    border: '1px solid #dde3ea',
  },
  accordionHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  accordionTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#023e8a',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  icone: {
    fontSize: 18,
  },
  seta: {
    color: '#0096c7',
    fontSize: 12,
    transition: 'transform 0.2s ease',
    display: 'inline-block',
  },
  accordionBody: {
    padding: '8px 16px 14px 16px',
    borderTop: '1px solid #eef2f7',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  entradaBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  entradaLinha: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    fontSize: 13,
    color: '#334155',
    lineHeight: 1.5,
  },
  entradaLabel: {
    fontWeight: '600',
    color: '#475569',
    whiteSpace: 'nowrap',
    minWidth: 80,
  },
  entradaValor: {
    color: '#334155',
  },
  loading: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
};

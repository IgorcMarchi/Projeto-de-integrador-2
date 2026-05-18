// src/pages/ReportarPage.jsx
// -------------------------------------------------------
// Tela "Reportar" do ConectaSH.
// Baseada no protótipo Figma (Tela 5 – Igor).
// Permite reportar problemas com tipo, descrição,
// localização, foto opcional e envio anônimo.
// -------------------------------------------------------

import React, { useState } from 'react';
import { salvarReporte } from '../api/supabaseService';

// ── Tipos de problema ─────────────────────────────────────
const TIPOS = [
  { valor: 'manutencao', label: 'MANUTENÇÃO', icone: '🔧' },
  { valor: 'itens',      label: 'ITENS',      icone: '📦' },
  { valor: 'ocupado',    label: 'OCUPADO',    icone: '🚧' },
  { valor: 'geral',      label: 'GERAL',      icone: '📋' },
];

// ── Tela de sucesso ───────────────────────────────────────
function TelaSucesso({ onReportarNovamente }) {
  return (
    <div style={styles.telaSuccesso}>
      <div style={styles.sucessoCard}>
        <span style={styles.sucessoIcone}>✅</span>
        <h2 style={styles.sucessoTitulo}>VOCÊ REPORTOU COM SUCESSO</h2>
        <p style={styles.sucessoTexto}>
          Obrigado pelo seu envio! Nossa equipe já recebeu as informações e
          estará tomando as devidas providências. Em breve, retornaremos com
          uma atualização, se necessário.
        </p>
        <button style={styles.botaoReportarNovamente} onClick={onReportarNovamente}>
          REPORTAR NOVAMENTE 🚩
        </button>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────
export default function ReportarPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState('manutencao');
  const [descricao, setDescricao]             = useState('');
  const [anonimo, setAnonimo]                 = useState(false);
  const [enviando, setEnviando]               = useState(false);
  const [enviado, setEnviado]                 = useState(false);
  const [erro, setErro]                       = useState('');

  async function handleEnviar() {
    if (!descricao.trim()) {
      setErro('Por favor, descreva o problema antes de enviar.');
      return;
    }

    setErro('');
    setEnviando(true);

    const resultado = await salvarReporte({
      tipo:      tipoSelecionado,
      descricao: descricao.trim(),
      anonimo,
      lat:       null, // futura integração com GPS
      lng:       null,
      foto_url:  null, // futura integração com câmera
    });

    setEnviando(false);

    if (resultado.sucesso) {
      setEnviado(true);
    } else {
      setErro(resultado.erro ?? 'Erro ao enviar. Tente novamente.');
    }
  }

  function resetar() {
    setTipoSelecionado('manutencao');
    setDescricao('');
    setAnonimo(false);
    setEnviado(false);
    setErro('');
  }

  // ── Tela de sucesso ──
  if (enviado) {
    return (
      <div style={styles.pagina}>
        <h1 style={styles.titulo}>REPORTAR</h1>
        <TelaSucesso onReportarNovamente={resetar} />
      </div>
    );
  }

  // ── Formulário ──
  return (
    <div style={styles.pagina}>
      <h1 style={styles.titulo}>REPORTAR</h1>

      <div style={styles.formulario}>

        {/* Tipo do problema */}
        <p style={styles.label}>QUAL É O PROBLEMA</p>
        <div style={styles.tiposContainer}>
          {TIPOS.map((tipo) => {
            const ativo = tipoSelecionado === tipo.valor;
            return (
              <button
                key={tipo.valor}
                onClick={() => setTipoSelecionado(tipo.valor)}
                style={{
                  ...styles.tipoBotao,
                  backgroundColor: ativo ? '#0096c7' : '#ffffff',
                  borderColor:     ativo ? '#0096c7' : '#cbd5e1',
                  color:           ativo ? '#ffffff' : '#475569',
                }}
              >
                <span style={styles.tipoIcone}>{tipo.icone}</span>
                <span style={styles.tipoLabel}>{tipo.label}</span>
              </button>
            );
          })}
        </div>

        {/* Descrição */}
        <p style={styles.label}>DESCREVA O PROBLEMA:</p>
        <textarea
          style={styles.textarea}
          placeholder="Descreva o problema aqui..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
        />

        {/* Localização */}
        <p style={styles.label}>LOCALIZAÇÃO</p>
        <button style={styles.botaoLocalizacao}>
          <span>📍</span>
          <span>USAR LOCALIZAÇÃO ATUAL</span>
        </button>
        <button style={{ ...styles.botaoLocalizacao, marginTop: 8 }}>
          <span>🗺️</span>
          <span>MARCAR NO MAPA</span>
        </button>

        {/* Foto opcional */}
        <p style={styles.label}>ADICIONAR FOTO (Opcional)</p>
        <button style={styles.botaoFoto}>
          <span style={styles.fotoIcone}>📷</span>
          <span style={styles.fotoTexto}>TOQUE PARA TIRAR FOTO</span>
        </button>

        {/* Envio anônimo */}
        <div style={styles.anonimoRow}>
          <input
            type="checkbox"
            id="anonimo"
            checked={anonimo}
            onChange={(e) => setAnonimo(e.target.checked)}
            style={styles.checkbox}
          />
          <label htmlFor="anonimo" style={styles.anonimoLabel}>
            Enviar como anônimo (Opcional)
          </label>
        </div>

        {/* Mensagem de erro */}
        {erro !== '' && <p style={styles.erroTexto}>{erro}</p>}

        {/* Botão enviar */}
        <button
          style={{ ...styles.botaoEnviar, opacity: enviando ? 0.7 : 1 }}
          onClick={handleEnviar}
          disabled={enviando}
        >
          {enviando ? 'ENVIANDO...' : 'ENVIAR RELATÓRIO 📤'}
        </button>

      </div>
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
  formulario: {
    padding: '0 16px',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#023e8a',
    letterSpacing: 0.5,
    margin: '16px 0 8px',
  },

  // Tipos
  tiposContainer: {
    display: 'flex',
    gap: 8,
  },
  tipoBotao: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '10px 4px',
    borderRadius: 10,
    border: '1.5px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tipoIcone: {
    fontSize: 20,
  },
  tipoLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Textarea
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: 10,
    border: '1.5px solid #cbd5e1',
    fontSize: 13,
    color: '#334155',
    backgroundColor: '#ffffff',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },

  // Localização
  botaoLocalizacao: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid #0096c7',
    backgroundColor: '#ffffff',
    color: '#0096c7',
    fontSize: 12,
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: 0.3,
  },

  // Foto
  botaoFoto: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '20px',
    borderRadius: 10,
    border: '2px dashed #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  fotoIcone: {
    fontSize: 28,
  },
  fotoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },

  // Anônimo
  anonimoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: 'pointer',
  },
  anonimoLabel: {
    fontSize: 13,
    color: '#475569',
    cursor: 'pointer',
  },

  // Erro
  erroTexto: {
    fontSize: 12,
    color: '#ef476f',
    margin: '8px 0 0',
    fontWeight: '600',
  },

  // Botão enviar
  botaoEnviar: {
    width: '100%',
    padding: '15px',
    marginTop: 20,
    backgroundColor: '#023e8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: 0.5,
  },

  // Tela sucesso
  telaSuccesso: {
    padding: '20px 16px',
  },
  sucessoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    textAlign: 'center',
  },
  sucessoIcone: {
    fontSize: 56,
  },
  sucessoTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#023e8a',
    margin: 0,
    letterSpacing: 0.5,
  },
  sucessoTexto: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
  botaoReportarNovamente: {
    padding: '12px 24px',
    backgroundColor: '#023e8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: 8,
  },
};

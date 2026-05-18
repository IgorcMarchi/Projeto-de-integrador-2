// src/pages/SugestoesPage.jsx
// -------------------------------------------------------
// Tela "Sugestões" do ConectaSH.
// Baseada no protótipo Figma (Tela 5 – Ian / Tela 6 – Ian).
// Permite enviar sugestões por setor com opção de anonimato.
// -------------------------------------------------------

import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { getUsuarioAtual } from '../api/supabaseService';

// ── Função para salvar sugestão ───────────────────────────
async function salvarSugestao({ setor, texto, anonimo }) {
  const usuario = await getUsuarioAtual();

  const payload = {
    setor,
    texto: texto.trim(),
    anonimo,
    user_id: anonimo ? null : (usuario?.id ?? null),
    status: 'aberta',
  };

  const { data, error } = await supabase
    .from('sugestoes')
    .insert([payload])
    .select()
    .single();

  if (error) return { sucesso: false, erro: error.message };
  return { sucesso: true, dados: data };
}

// ── Tela de sucesso ───────────────────────────────────────
function TelaSucesso({ onNovaSugestao }) {
  return (
    <div style={styles.telaSuccesso}>
      <div style={styles.sucessoCard}>
        <h2 style={styles.sucessoTitulo}>Obrigado</h2>
        <p style={styles.sucessoSubtitulo}>A cidade pode melhorar por sua causa</p>
        <button style={styles.botaoNovaSugestao} onClick={onNovaSugestao}>
          Escrever uma nova sugestão
        </button>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────
export default function SugestoesPage() {
  const [setorUrbano,    setSetorUrbano]    = useState(false);
  const [setorFlorestal, setSetorFlorestal] = useState(false);
  const [anonimo,        setAnonimo]        = useState(false);
  const [texto,          setTexto]          = useState('');
  const [enviando,       setEnviando]       = useState(false);
  const [enviado,        setEnviado]        = useState(false);
  const [erro,           setErro]           = useState('');

  // Monta a string de setor com base nos checkboxes
  function getSetor() {
    if (setorUrbano && setorFlorestal) return 'urbano_florestal';
    if (setorUrbano)                   return 'urbano';
    if (setorFlorestal)                return 'florestal';
    return '';
  }

  async function handleEnviar() {
    if (!texto.trim()) {
      setErro('Por favor, escreva sua sugestão antes de enviar.');
      return;
    }
    if (!setorUrbano && !setorFlorestal) {
      setErro('Selecione ao menos um setor para a sugestão.');
      return;
    }

    setErro('');
    setEnviando(true);

    const resultado = await salvarSugestao({
      setor:  getSetor(),
      texto,
      anonimo,
    });

    setEnviando(false);

    if (resultado.sucesso) {
      setEnviado(true);
    } else {
      setErro('Erro ao enviar. Tente novamente.');
    }
  }

  function resetar() {
    setSetorUrbano(false);
    setSetorFlorestal(false);
    setAnonimo(false);
    setTexto('');
    setEnviado(false);
    setErro('');
  }

  // ── Tela de sucesso ──
  if (enviado) {
    return (
      <div style={styles.pagina}>
        <h1 style={styles.titulo}>SUGESTÕES</h1>
        <TelaSucesso onNovaSugestao={resetar} />
      </div>
    );
  }

  // ── Formulário ──
  return (
    <div style={styles.pagina}>
      <h1 style={styles.titulo}>SUGESTÕES</h1>

      <div style={styles.formulario}>

        {/* Destino da sugestão */}
        <p style={styles.label}>Para onde é sua sugestão</p>

        <div style={styles.checkboxCard}>
          {/* Setor Urbano */}
          <div style={styles.checkboxRow}>
            <label style={styles.checkboxLabel} htmlFor="urbano">
              Setor urbano (Cidade, Praia)
            </label>
            <div
              id="urbano"
              onClick={() => setSetorUrbano(!setorUrbano)}
              style={{
                ...styles.toggle,
                backgroundColor: setorUrbano ? '#0096c7' : '#cbd5e1',
              }}
            >
              <div style={{
                ...styles.toggleBola,
                transform: setorUrbano ? 'translateX(20px)' : 'translateX(2px)',
              }} />
            </div>
          </div>

          {/* Setor Florestal */}
          <div style={styles.checkboxRow}>
            <label style={styles.checkboxLabel} htmlFor="florestal">
              Setor florestal (Reservas)
            </label>
            <div
              id="florestal"
              onClick={() => setSetorFlorestal(!setorFlorestal)}
              style={{
                ...styles.toggle,
                backgroundColor: setorFlorestal ? '#06d6a0' : '#cbd5e1',
              }}
            >
              <div style={{
                ...styles.toggleBola,
                transform: setorFlorestal ? 'translateX(20px)' : 'translateX(2px)',
              }} />
            </div>
          </div>

          {/* Anônimo */}
          <div style={styles.checkboxRow}>
            <label style={styles.checkboxLabel} htmlFor="anonimo">
              Enviar como anônimo (Opcional)
            </label>
            <div
              id="anonimo"
              onClick={() => setAnonimo(!anonimo)}
              style={{
                ...styles.toggle,
                backgroundColor: anonimo ? '#0096c7' : '#cbd5e1',
              }}
            >
              <div style={{
                ...styles.toggleBola,
                transform: anonimo ? 'translateX(20px)' : 'translateX(2px)',
              }} />
            </div>
          </div>
        </div>

        {/* Texto da sugestão */}
        <p style={styles.label}>Escreva aqui sua sugestão</p>
        <textarea
          style={styles.textarea}
          placeholder="Colocar mais calçadas na cidade..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
        />

        {/* Erro */}
        {erro !== '' && <p style={styles.erroTexto}>{erro}</p>}

        {/* Botão enviar */}
        <button
          style={{ ...styles.botaoEnviar, opacity: enviando ? 0.7 : 1 }}
          onClick={handleEnviar}
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar sugestão'}
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
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    margin: '16px 0 8px',
  },

  // Card de checkboxes
  checkboxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: '4px 0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },
  checkboxRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#334155',
    cursor: 'pointer',
  },

  // Toggle estilo switch
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },
  toggleBola: {
    position: 'absolute',
    top: 3,
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s ease',
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
    lineHeight: 1.5,
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
  },

  // Tela sucesso
  telaSuccesso: {
    padding: '40px 16px',
  },
  sucessoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    textAlign: 'center',
  },
  sucessoTitulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
  },
  sucessoSubtitulo: {
    fontSize: 15,
    color: '#475569',
    margin: 0,
    lineHeight: 1.5,
  },
  botaoNovaSugestao: {
    padding: '12px 24px',
    backgroundColor: '#0096c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: 8,
  },
};

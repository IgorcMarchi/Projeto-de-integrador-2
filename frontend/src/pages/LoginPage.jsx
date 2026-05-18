// src/pages/LoginPage.jsx
// -------------------------------------------------------
// Tela de Login/Cadastro do ConectaSH.
// Usa o Supabase Auth para autenticação com e-mail e senha.
// Tem dois modos: LOGIN e CADASTRO, alternáveis na mesma tela.
// -------------------------------------------------------

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const destino   = location.state?.de || '/';

  // Alterna entre 'login' e 'cadastro'
  const [modo, setModo] = useState('login');

  // Campos do formulário
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [confirma, setConfirma] = useState(''); // só no cadastro

  // Estados de controle
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]             = useState('');
  const [sucesso, setSucesso]       = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // ── Login ──────────────────────────────────────────────
  async function handleLogin() {
    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setErro('');
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setCarregando(false);

    if (error) {
      // Traduz os erros mais comuns do Supabase para português
      if (error.message.includes('Invalid login credentials')) {
        setErro('E-mail ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        setErro('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.');
      } else {
        setErro('Erro ao entrar. Tente novamente.');
      }
      return;
    }

    // Login OK → volta para a página que tentou acessar (ou Home)
    navigate(destino, { replace: true });
  }

  // ── Cadastro ───────────────────────────────────────────
  async function handleCadastro() {
    if (!email || !senha || !confirma) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (senha !== confirma) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setErro('');
    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
    });

    setCarregando(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setErro('Este e-mail já está cadastrado. Faça login.');
      } else {
        setErro('Erro ao cadastrar. Tente novamente.');
      }
      return;
    }

    // Cadastro OK → mostra mensagem para confirmar e-mail
    setSucesso('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
    setEmail('');
    setSenha('');
    setConfirma('');
  }

  function handleSubmit() {
    setSucesso('');
    if (modo === 'login') {
      handleLogin();
    } else {
      handleCadastro();
    }
  }

  // ── Renderização ───────────────────────────────────────
  return (
    <div style={styles.pagina}>

      {/* Logo e título */}
      <div style={styles.cabecalho}>
        <h1 style={styles.logo}>Conecta SH</h1>
        <p style={styles.subtitulo}>O futuro de Santa Helena na palma da mão</p>
      </div>

      {/* Card do formulário */}
      <div style={styles.card}>

        {/* Abas Login / Cadastro */}
        <div style={styles.abas}>
          <button
            style={{
              ...styles.aba,
              borderBottom: modo === 'login' ? '3px solid #00b4d8' : '3px solid transparent',
              color: modo === 'login' ? '#00b4d8' : '#94a3b8',
            }}
            onClick={() => { setModo('login'); setErro(''); setSucesso(''); }}
          >
            Entrar
          </button>
          <button
            style={{
              ...styles.aba,
              borderBottom: modo === 'cadastro' ? '3px solid #00b4d8' : '3px solid transparent',
              color: modo === 'cadastro' ? '#00b4d8' : '#94a3b8',
            }}
            onClick={() => { setModo('cadastro'); setErro(''); setSucesso(''); }}
          >
            Cadastrar
          </button>
        </div>

        {/* Campos */}
        <div style={styles.campos}>

          {/* E-mail */}
          <div style={styles.campoGroup}>
            <label style={styles.campoLabel}>E-mail</label>
            <input
              type="email"
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Senha */}
          <div style={styles.campoGroup}>
            <label style={styles.campoLabel}>Senha</label>
            <div style={styles.senhaContainer}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                style={{ ...styles.input, paddingRight: 44 }}
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                style={styles.olhoBtn}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex={-1}
              >
                {mostrarSenha ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirmar senha — só no cadastro */}
          {modo === 'cadastro' && (
            <div style={styles.campoGroup}>
              <label style={styles.campoLabel}>Confirmar Senha</label>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                style={styles.input}
                placeholder="Repita a senha"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}

          {/* Mensagem de erro */}
          {erro !== '' && (
            <div style={styles.erroBox}>
              <span>⚠️</span>
              <p style={styles.erroTexto}>{erro}</p>
            </div>
          )}

          {/* Mensagem de sucesso */}
          {sucesso !== '' && (
            <div style={styles.sucessoBox}>
              <span>✅</span>
              <p style={styles.sucessoTexto}>{sucesso}</p>
            </div>
          )}

          {/* Botão principal */}
          <button
            style={{ ...styles.botaoPrincipal, opacity: carregando ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={carregando}
          >
            {carregando
              ? 'Aguarde...'
              : modo === 'login' ? 'Entrar' : 'Criar conta'
            }
          </button>

          {/* Link esqueci a senha — só no login */}
          {modo === 'login' && (
            <button
              style={styles.linkEsqueci}
              onClick={() => navigate('/recuperar-senha')}
            >
              Esqueci minha senha
            </button>
          )}

        </div>
      </div>

      {/* Continuar sem login */}
      <button style={styles.botaoConvidado} onClick={() => navigate('/')}>
        Continuar sem login
      </button>

    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────
const styles = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#012a5e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },

  // Cabeçalho
  cabecalho: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: {
    fontFamily: 'Impact, sans-serif',
    fontSize: 36,
    color: '#00b4d8',
    textShadow: '0 0 20px #0096c7',
    margin: 0,
    letterSpacing: 2,
  },
  subtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    margin: '8px 0 0',
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },

  // Abas
  abas: {
    display: 'flex',
    borderBottom: '1px solid #f1f5f9',
  },
  aba: {
    flex: 1,
    padding: '16px',
    background: 'none',
    border: 'none',
    fontSize: 14,
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: 0.5,
    transition: 'all 0.15s ease',
  },

  // Campos
  campos: {
    padding: '24px 24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  campoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  campoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #cbd5e1',
    fontSize: 14,
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease',
  },
  senhaContainer: {
    position: 'relative',
  },
  olhoBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
  },

  // Mensagens
  erroBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffeef2',
    borderRadius: 8,
    padding: '10px 12px',
  },
  erroTexto: {
    fontSize: 12,
    color: '#ef476f',
    margin: 0,
    fontWeight: '600',
  },
  sucessoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e0fff7',
    borderRadius: 8,
    padding: '10px 12px',
  },
  sucessoTexto: {
    fontSize: 12,
    color: '#06d6a0',
    margin: 0,
    fontWeight: '600',
  },

  // Botões
  botaoPrincipal: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#023e8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  linkEsqueci: {
    background: 'none',
    border: 'none',
    color: '#0096c7',
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'underline',
    padding: 0,
  },

  // Convidado
  botaoConvidado: {
    marginTop: 20,
    background: 'none',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    padding: '10px 24px',
    cursor: 'pointer',
  },
};

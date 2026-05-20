// src/pages/PerfilPage.jsx
// -------------------------------------------------------
// Página de Perfil do usuário.
// Permite editar dados pessoais e fazer logout.
// -------------------------------------------------------

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarPerfil, atualizarPerfil, logout } from '../api/supabaseService';

export default function PerfilPage() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    tipo_usuario: '',
    email: '',
    telefone: '',
    genero: '',
    avatar_url: '',
  });

  useEffect(() => {
    async function carregar() {
      try {
        const perfil = await buscarPerfil();
        if (perfil) {
          setFormData({
            nome_completo: perfil.nome_completo || '',
            tipo_usuario: perfil.tipo_usuario || '',
            email: perfil.email || '',
            telefone: perfil.telefone || '',
            genero: perfil.genero || '',
            avatar_url: perfil.avatar_url || '',
          });
        } else {
          setMensagem('⚠️ Não foi possível carregar o perfil');
        }
      } catch (erro) {
        console.error('Erro ao carregar perfil:', erro);
        setMensagem('⚠️ Erro ao carregar perfil');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');

    console.log('Salvando perfil:', formData);

    try {
      const resultado = await atualizarPerfil(formData);
      if (resultado.sucesso) {
        setMensagem('✓ Perfil atualizado com sucesso!');
        console.log('Perfil salvo com sucesso');
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('✗ Erro ao atualizar perfil: ' + resultado.erro);
        console.error('Erro ao salvar:', resultado.erro);
      }
    } catch (erro) {
      console.error('Erro catch:', erro);
      setMensagem('✗ Erro ao atualizar perfil: ' + erro.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair da conta?')) {
      await logout();
      navigate('/login');
    }
  };

  if (carregando) {
    return (
      <div style={styles.pagina}>
        <h1 style={styles.titulo}>MEU PERFIL</h1>
        <p style={styles.loading}>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div style={styles.pagina}>
      <h1 style={styles.titulo}>MEU PERFIL</h1>

      <form style={styles.formulario} onSubmit={handleSalvar}>
        {/* Nome Completo */}
        <div style={styles.grupo}>
          <label style={styles.label}>Nome Completo</label>
          <input
            type="text"
            name="nome_completo"
            value={formData.nome_completo}
            onChange={handleChange}
            style={styles.input}
            placeholder="Digite seu nome completo"
          />
        </div>

        {/* Email */}
        <div style={styles.grupo}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ ...styles.input, backgroundColor: '#f5f5f5' }}
            placeholder="seu@email.com"
            disabled
            title="O email não pode ser alterado aqui. Altere nas configurações de segurança da sua conta."
          />
        </div>

        {/* Telefone */}
        <div style={styles.grupo}>
          <label style={styles.label}>Telefone</label>
          <input
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            style={styles.input}
            placeholder="(45) 99999-9999"
          />
        </div>

        {/* Tipo de Usuário */}
        <div style={styles.grupo}>
          <label style={styles.label}>Tipo de Usuário</label>
          <select
            name="tipo_usuario"
            value={formData.tipo_usuario}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Selecione um tipo</option>
            <option value="visitante">Visitante</option>
            <option value="residente">Residente</option>
            <option value="prestador">Prestador de Serviço</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        {/* Gênero */}
        <div style={styles.grupo}>
          <label style={styles.label}>Gênero</label>
          <select
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Selecione um gênero</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
            <option value="prefiro_nao_informar">Prefiro não informar</option>
          </select>
        </div>

        {/* URL do Avatar */}
        <div style={styles.grupo}>
          <label style={styles.label}>URL do Avatar</label>
          <input
            type="url"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handleChange}
            style={styles.input}
            placeholder="https://exemplo.com/avatar.jpg"
          />
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div style={{
            ...styles.mensagem,
            backgroundColor: mensagem.startsWith('✓') ? '#d4edda' : '#f8d7da',
            color: mensagem.startsWith('✓') ? '#155724' : '#721c24',
          }}>
            {mensagem}
          </div>
        )}

        {/* Botões */}
        <div style={styles.botoes}>
          <button
            type="submit"
            disabled={salvando}
            style={{
              ...styles.botao,
              opacity: salvando ? 0.6 : 1,
              cursor: salvando ? 'not-allowed' : 'pointer',
            }}
          >
            {salvando ? 'Salvando...' : '💾 SALVAR ALTERAÇÕES'}
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            style={styles.botaoLogout}
          >
            🚪 SAIR DA CONTA
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────
const styles = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    paddingBottom: 80,
    padding: '20px 16px 80px',
  },
  titulo: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00b4d8',
    textShadow: '1px 1px 0 #0077b6',
    letterSpacing: 2,
    margin: '0 0 24px',
    fontFamily: 'Impact, sans-serif',
  },
  formulario: {
    maxWidth: 600,
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  },
  grupo: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  input: {
    fontSize: 14,
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: 6,
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    width: '100%',
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#0096c7',
  },
  mensagem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  botoes: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
  },
  botao: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#0096c7',
    border: 'none',
    borderRadius: 6,
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
  },
  botaoLogout: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#ef476f',
    border: 'none',
    borderRadius: 6,
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
  },
  loading: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
};

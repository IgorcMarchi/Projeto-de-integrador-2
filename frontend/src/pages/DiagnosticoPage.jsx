// src/pages/DiagnosticoPage.jsx
// Página para debugar problemas de cadastro e perfil

import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';

export default function DiagnosticoPage() {
  const [output, setOutput] = useState('');
  const [teste, setTeste] = useState('');

  const testar = async (nome) => {
    let resultado = `\n[${nome}]\n`;
    
    try {
      if (nome === 'signup-simples') {
        const email = 'teste' + Date.now() + '@gmail.com';
        resultado += `Email: ${email}\n`;
        
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: 'senha123456',
        });
        
        resultado += `Erro: ${error ? error.message : 'SEM ERRO'}\n`;
        resultado += `Data: ${JSON.stringify(data)}\n`;
      }
      
      else if (nome === 'session') {
        const { data, error } = await supabase.auth.getSession();
        resultado += `Error: ${error ? error.message : 'SEM ERRO'}\n`;
        resultado += `User: ${data.session?.user?.email || 'NÃO LOGADO'}\n`;
      }
      
      else if (nome === 'profiles-rls') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        resultado += `Error: ${error ? error.message : 'SEM ERRO'}\n`;
        resultado += `Data: ${JSON.stringify(data)}\n`;
      }
    } catch (e) {
      resultado += `EXCEPTION: ${e.message}\n`;
    }
    
    setOutput(output + resultado);
  };

  return (
    <div style={{ padding: 20, backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🔧 Diagnóstico</h1>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => { setOutput(''); testar('signup-simples'); }} style={styles.btn}>
          Testar Signup
        </button>
        <button onClick={() => testar('session')} style={styles.btn}>
          Testar Session
        </button>
        <button onClick={() => testar('profiles-rls')} style={styles.btn}>
          Testar RLS
        </button>
        <button onClick={() => setOutput('')} style={{ ...styles.btn, backgroundColor: '#ccc' }}>
          Limpar
        </button>
      </div>
      
      <textarea
        value={output}
        readOnly
        style={{
          width: '100%',
          height: 400,
          padding: 10,
          fontFamily: 'monospace',
          fontSize: 12,
          backgroundColor: '#1e1e1e',
          color: '#00ff00',
          border: 'none',
          borderRadius: 8,
        }}
      />
    </div>
  );
}

const styles = {
  btn: {
    padding: '10px 20px',
    backgroundColor: '#0096c7',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'bold',
  },
};

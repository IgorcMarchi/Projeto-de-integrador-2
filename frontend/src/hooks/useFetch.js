// src/hooks/useFetch.js
import { useState, useEffect } from 'react';

/**
 * Hook genérico para buscar dados.
 * @param {Function} funcaoBusca - qualquer função do supabaseService
 * @param {any} dadosFallback - o que mostrar se der erro (seus mocks)
 */
export function useFetch(funcaoBusca, dadosFallback = []) {
  const [dados, setDados] = useState(dadosFallback);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function buscar() {
      try {
        setCarregando(true);
        const resultado = await funcaoBusca();
        setDados(resultado?.length > 0 ? resultado : dadosFallback);
      } catch (e) {

        console.log("ERRO SUPABASE:", e);

        setErro(e.message);
        setDados(dadosFallback);

      } finally {
        setCarregando(false);
      }
    }

    buscar();
  }, []); // roda só uma vez ao montar o componente

  return { dados, carregando, erro };
}
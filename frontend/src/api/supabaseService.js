// src/api/supabaseService.js
// -------------------------------------------------------
// Funções prontas para buscar e salvar dados no Supabase.
// Importe só o que precisar em cada componente.
// -------------------------------------------------------

import { supabase } from './supabaseClient';

// ══════════════════════════════════════════════════════
//  HORÁRIOS
// ══════════════════════════════════════════════════════

/**
 * Busca todos os horários do banco.
 * Retorna um array agrupado por categoria.
 */
export async function buscarHorarios() {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .order('servico');

  if (error) {
    console.error('Erro ao buscar horários:', error.message);
    return [];
  }
  return data;
}

// ══════════════════════════════════════════════════════
//  EVENTOS
// ══════════════════════════════════════════════════════

/**
 * Busca todos os eventos futuros do banco, ordenados por data.
 */
export async function buscarEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: true });

  if (error) {
    console.error('Erro ao buscar eventos:', error.message);
    return [];
  }
  return data;
}

// ══════════════════════════════════════════════════════
//  NOTIFICAÇÕES
// ══════════════════════════════════════════════════════

/**
 * Busca notificações do usuário logado.
 * Retorna as 20 mais recentes.
 */
export async function buscarNotificacoes() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Erro ao buscar notificações:', error.message);
    return [];
  }
  return data;
}

/**
 * Marca uma notificação como lida.
 * @param {number} id - ID da notificação
 */
export async function marcarComoLida(id) {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', id);

  if (error) console.error('Erro ao marcar notificação:', error.message);
}

// ══════════════════════════════════════════════════════
//  PONTOS DO MAPA (Quiosques, Segurança, etc.)
// ══════════════════════════════════════════════════════

/**
 * Busca pontos da prainha, com filtro opcional por tipo.
 * @param {string|null} tipo - 'quiosque' | 'seguranca' | 'banheiro' | 'alimentacao' | null (todos)
 */
export async function buscarPontosMapa(tipo = null) {
  let query = supabase.from('locais_prainha').select('*').order('nome');

  if (tipo) {
    query = query.eq('tipo', tipo);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar pontos:', error.message);
    return [];
  }
  return data;
}

// ══════════════════════════════════════════════════════
//  REPORTES / DENÚNCIAS
// ══════════════════════════════════════════════════════

/**
 * Salva um novo reporte/denúncia no banco.
 * @param {object} reporte - { tipo, descricao, lat, lng, foto_url, anonimo }
 */
export async function salvarReporte(reporte) {
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    categoria: reporte.tipo,
    descricao: reporte.descricao,
    latitude:  reporte.lat,
    longitude: reporte.lng,
    foto_url:  reporte.foto_url,
    user_id:   reporte.anonimo ? null : (user?.id ?? null),
    status:    'aberto',
  };

  const { data, error } = await supabase
    .from('incidentes')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar reporte:', error.message);
    return { sucesso: false, erro: error.message };
  }

  return { sucesso: true, dados: data };
}

// ══════════════════════════════════════════════════════
//  AUTENTICAÇÃO
// ══════════════════════════════════════════════════════

/** Retorna o usuário logado ou null */
export async function getUsuarioAtual() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Login com e-mail e senha */
export async function loginComEmail(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { sucesso: false, erro: error.message };
  return { sucesso: true, usuario: data.user };
}

/** Logout */
export async function logout() {
  await supabase.auth.signOut();
}

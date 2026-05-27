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
 * Busca notificações do usuário logado e notificações globais.
 * Retorna as 20 mais recentes combinadas.
 */
export async function buscarNotificacoes() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Busca TODAS as notificações (usuário + globais)
  // e filtra localmente
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Erro ao buscar notificações:', error.message);
    return [];
  }

  // Filtra: notificações do usuário OU globais (user_id = null)
  const notificacoesFiltradas = (data || []).filter(notif => 
    notif.user_id === user.id || notif.user_id === null
  );

  console.log('Todas as notificações do banco:', data);
  console.log('Notificações filtradas (usuário + globais):', notificacoesFiltradas);

  return notificacoesFiltradas.slice(0, 20);
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

  const { error } = await supabase
    .from('incidentes')
    .insert([payload]);

  if (error) {
    console.error('Erro ao salvar reporte:', error.message);
    return { sucesso: false, erro: error.message };
  }

  return { sucesso: true };
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

// ══════════════════════════════════════════════════════
//  PERFIL
// ══════════════════════════════════════════════════════

/**
 * Busca o perfil completo do usuário logado.
 * Retorna um objeto com dados pessoais.
 */
export async function buscarPerfil() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil:', error.message);
    return null;
  }
  return data;
}

/**
 * Atualiza o perfil do usuário logado.
 * @param {object} dados - { nome_completo, email, telefone, genero, avatar_url, tipo_usuario }
 * @returns {object} { sucesso: boolean, erro?: string }
 */
export async function atualizarPerfil(dados) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { sucesso: false, erro: 'Usuário não autenticado' };
  }

  // Tipos válidos no banco: morador, turista, admin
  const tiposValidos = ['morador', 'turista', 'admin'];
  const tipoNormalizado = dados.tipo_usuario ? dados.tipo_usuario.toLowerCase().trim() : null;
  
  if (tipoNormalizado && !tiposValidos.includes(tipoNormalizado)) {
    return { sucesso: false, erro: 'Tipo de usuário inválido' };
  }

  // Gêneros válidos no banco: Masculino, Feminino, Outro, Prefiro não informar
  const generosValidos = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];
  const generoNormalizado = dados.genero ? dados.genero.trim() : null;
  
  if (generoNormalizado && !generosValidos.includes(generoNormalizado)) {
    return { sucesso: false, erro: 'Gênero inválido' };
  }

  const payload = {
    nome_completo: dados.nome_completo || null,
    telefone: dados.telefone || null,
    genero: generoNormalizado || null,
    avatar_url: dados.avatar_url || null,
    tipo_usuario: tipoNormalizado || null,
  };

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id);

  if (error) {
    console.error('Erro ao atualizar perfil:', error.message);
    return { sucesso: false, erro: error.message };
  }

  return { sucesso: true };
}

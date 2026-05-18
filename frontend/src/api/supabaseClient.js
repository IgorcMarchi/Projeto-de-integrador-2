// src/api/supabaseClient.js
// -------------------------------------------------------
// Cria e exporta o cliente Supabase.
// Troque os valores abaixo pelas suas credenciais reais:
//   Project Settings → API  no dashboard do Supabase.
// -------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'SUA_CHAVE_ANON_PUBLICA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
  ─── COMO USAR ────────────────────────────────────────────
  1. Crie um arquivo .env na raiz do projeto com:
       REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
       REACT_APP_SUPABASE_ANON_KEY=eyJ...

  2. Em qualquer componente, importe assim:
       import { supabase } from '../api/supabaseClient';

  ─── TABELAS NECESSÁRIAS NO SUPABASE ─────────────────────
  Execute este SQL no SQL Editor do Supabase:

  -- Horários de serviços
  create table horarios (
    id          bigint generated always as identity primary key,
    titulo      text not null,           -- ex: "Ônibus – Dias Úteis"
    categoria   text not null,           -- 'onibus' | 'lixo_organico' | 'lixo_reciclavel'
    descricao   text,
    horarios    jsonb,                   -- array de strings com os horários
    criado_em   timestamptz default now()
  );

  -- Notificações do usuário
  create table notificacoes (
    id          bigint generated always as identity primary key,
    user_id     uuid references auth.users,
    titulo      text not null,
    mensagem    text,
    tipo        text,                    -- 'evento' | 'reporte' | 'sistema'
    lida        boolean default false,
    imagem_url  text,
    criado_em   timestamptz default now()
  );

  -- Pontos no mapa (quiosques, distribuidoras, lojas)
  create table pontos_mapa (
    id          bigint generated always as identity primary key,
    nome        text not null,
    endereco    text,
    categoria   text,                    -- 'quiosque' | 'distribuidora' | 'loja' | 'mercado'
    numero      int,
    lat         float8,
    lng         float8,
    criado_em   timestamptz default now()
  );

  -- Reportes / denúncias cidadãs
  create table reportes (
    id          bigint generated always as identity primary key,
    user_id     uuid references auth.users,
    tipo        text,                    -- 'manutencao' | 'itens' | 'ocupado' | 'geral'
    descricao   text not null,
    lat         float8,
    lng         float8,
    foto_url    text,
    anonimo     boolean default false,
    status      text default 'aberto',  -- 'aberto' | 'em_analise' | 'resolvido'
    criado_em   timestamptz default now()
  );
*/

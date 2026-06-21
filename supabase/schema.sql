
-- ============================================================
-- Calculadora de Prazos — Schema Supabase
-- ============================================================

-- Habilitar extensão uuid
create extension if not exists "uuid-ossp";

-- ============================================================
-- ESTADOS
-- ============================================================
create table if not exists estados (
  sigla char(2) primary key,
  nome text not null
);

-- ============================================================
-- MUNICÍPIOS
-- ============================================================
create table if not exists municipios (
  id serial primary key,
  nome text not null,
  estado_sigla char(2) not null references estados(sigla),
  codigo_ibge text unique
);

create index if not exists municipios_estado_sigla_idx on municipios(estado_sigla);

-- ============================================================
-- FERIADOS
-- ============================================================
do $$ begin
  create type tipo_feriado as enum ('nacional', 'estadual', 'municipal');
exception when duplicate_object then null;
end $$;

create table if not exists feriados (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  data date not null,
  tipo tipo_feriado not null,
  recorrente boolean not null default true, -- true = repete todo ano na mesma data
  estado_sigla char(2) references estados(sigla),
  municipio_id int references municipios(id)
);

-- índices para busca eficiente
create index if not exists feriados_data_idx on feriados(data);
create index if not exists feriados_tipo_idx on feriados(tipo);
create index if not exists feriados_estado_sigla_idx on feriados(estado_sigla);
create index if not exists feriados_municipio_id_idx on feriados(municipio_id);

-- ============================================================
-- CÁLCULOS (histórico por usuário)
-- ============================================================
create table if not exists calculos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text,
  estado_sigla char(2) references estados(sigla),
  municipio_id int references municipios(id),
  tribunal text,
  sistema text,
  cliente text,
  numero_processo text,
  providencia text,
  data_inicio date not null,
  dias_uteis int not null,
  data_fim date not null,
  feriados_encontrados jsonb default '[]',
  created_at timestamptz not null default now()
);

create index if not exists calculos_user_id_idx on calculos(user_id);
create index if not exists calculos_created_at_idx on calculos(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table calculos enable row level security;
alter table feriados enable row level security;
alter table estados enable row level security;
alter table municipios enable row level security;

drop policy if exists "Usuário vê apenas seus cálculos" on calculos;
create policy "Usuário vê apenas seus cálculos"
  on calculos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Feriados são públicos" on feriados;
create policy "Feriados são públicos" on feriados for select using (true);

drop policy if exists "Estados são públicos" on estados;
create policy "Estados são públicos" on estados for select using (true);

drop policy if exists "Municípios são públicos" on municipios;
create policy "Municípios são públicos" on municipios for select using (true);

-- ============================================================
-- DADOS — ESTADOS
-- ============================================================
insert into estados (sigla, nome) values
  ('AC','Acre'),('AL','Alagoas'),('AP','Amapá'),('AM','Amazonas'),
  ('BA','Bahia'),('CE','Ceará'),('DF','Distrito Federal'),
  ('ES','Espírito Santo'),('GO','Goiás'),('MA','Maranhão'),
  ('MT','Mato Grosso'),('MS','Mato Grosso do Sul'),('MG','Minas Gerais'),
  ('PA','Pará'),('PB','Paraíba'),('PR','Paraná'),('PE','Pernambuco'),
  ('PI','Piauí'),('RJ','Rio de Janeiro'),('RN','Rio Grande do Norte'),
  ('RS','Rio Grande do Sul'),('RO','Rondônia'),('RR','Roraima'),
  ('SC','Santa Catarina'),('SP','São Paulo'),('SE','Sergipe'),
  ('TO','Tocantins')
on conflict do nothing;

-- ============================================================
-- DADOS — FERIADOS NACIONAIS (recorrentes)
-- ============================================================
insert into feriados (nome, data, tipo, recorrente) values
  ('Confraternização Universal',       '2024-01-01', 'nacional', true),
  ('Carnaval',                          '2024-02-12', 'nacional', false),
  ('Carnaval',                          '2024-02-13', 'nacional', false),
  ('Quarta-Feira de Cinzas (meio dia)', '2024-02-14', 'nacional', false),
  ('Paixão de Cristo',                  '2024-03-29', 'nacional', false),
  ('Tiradentes',                        '2024-04-21', 'nacional', true),
  ('Dia do Trabalho',                   '2024-05-01', 'nacional', true),
  ('Corpus Christi',                    '2024-05-30', 'nacional', false),
  ('Independência do Brasil',           '2024-09-07', 'nacional', true),
  ('Nossa Sra. Aparecida',              '2024-10-12', 'nacional', true),
  ('Finados',                           '2024-11-02', 'nacional', true),
  ('Proclamação da República',          '2024-11-15', 'nacional', true),
  ('Natal',                             '2024-12-25', 'nacional', true),
  -- 2025
  ('Confraternização Universal',        '2025-01-01', 'nacional', true),
  ('Carnaval',                          '2025-03-03', 'nacional', false),
  ('Carnaval',                          '2025-03-04', 'nacional', false),
  ('Quarta-Feira de Cinzas (meio dia)', '2025-03-05', 'nacional', false),
  ('Paixão de Cristo',                  '2025-04-18', 'nacional', false),
  ('Tiradentes',                        '2025-04-21', 'nacional', true),
  ('Dia do Trabalho',                   '2025-05-01', 'nacional', true),
  ('Corpus Christi',                    '2025-06-19', 'nacional', false),
  ('Independência do Brasil',           '2025-09-07', 'nacional', true),
  ('Nossa Sra. Aparecida',              '2025-10-12', 'nacional', true),
  ('Finados',                           '2025-11-02', 'nacional', true),
  ('Proclamação da República',          '2025-11-15', 'nacional', true),
  ('Natal',                             '2025-12-25', 'nacional', true),
  -- 2026
  ('Confraternização Universal',        '2026-01-01', 'nacional', true),
  ('Carnaval',                          '2026-02-16', 'nacional', false),
  ('Carnaval',                          '2026-02-17', 'nacional', false),
  ('Quarta-Feira de Cinzas (meio dia)', '2026-02-18', 'nacional', false),
  ('Paixão de Cristo',                  '2026-04-03', 'nacional', false),
  ('Tiradentes',                        '2026-04-21', 'nacional', true),
  ('Dia do Trabalho',                   '2026-05-01', 'nacional', true),
  ('Corpus Christi',                    '2026-06-04', 'nacional', false),
  ('Independência do Brasil',           '2026-09-07', 'nacional', true),
  ('Nossa Sra. Aparecida',              '2026-10-12', 'nacional', true),
  ('Finados',                           '2026-11-02', 'nacional', true),
  ('Proclamação da República',          '2026-11-15', 'nacional', true),
  ('Natal',                             '2026-12-25', 'nacional', true)
on conflict do nothing;
-- QuizApp — migración Fase 11.5: multi-usuario
-- Añade user_id a tests y a config; backfill a karla.
--
-- Ejecutable en SQL Editor de Supabase. Idempotente: se puede ejecutar varias
-- veces sin error.

-- ============================================================
-- 1. tests.user_id (con backfill a karla)
-- ============================================================
alter table tests
  add column if not exists user_id uuid references users(id) on delete cascade;

update tests
set user_id = (select id from users where username = 'karla')
where user_id is null;

alter table tests
  alter column user_id set not null;

create index if not exists idx_tests_user on tests(user_id);

-- ============================================================
-- 2. config: una fila por usuario (PK pasa de id=1 a user_id)
-- ============================================================

-- 2a. Añadir user_id (nullable inicialmente).
alter table config
  add column if not exists user_id uuid references users(id) on delete cascade;

-- 2b. Backfill: la fila existente (id=1) pertenece a karla.
update config
set user_id = (select id from users where username = 'karla')
where user_id is null;

-- 2c. NOT NULL.
alter table config
  alter column user_id set not null;

-- 2d. Migrar PK de (id) a (user_id) si la columna id todavía existe.
-- En reejecuciones el bloque entero se salta porque la columna ya no está.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'config' and column_name = 'id'
  ) then
    alter table config drop constraint config_pkey;
    alter table config drop column id;
    alter table config add primary key (user_id);
  end if;
end $$;

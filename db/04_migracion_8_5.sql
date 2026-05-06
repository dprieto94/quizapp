-- QuizApp — migración Fase 8.5
-- Cambio de requisitos: preguntas configurables (20-30), multi-tema, justificacion + fuente.
--
-- Ejecutable en SQL Editor de Supabase. Idempotente: se puede ejecutar varias
-- veces sin error.

-- ============================================================
-- 1. config: añadir preguntas_por_test (default 20, rango 20-30)
-- ============================================================
alter table config
  add column if not exists preguntas_por_test int not null default 20;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'config_preguntas_por_test_check'
  ) then
    alter table config add constraint config_preguntas_por_test_check
      check (preguntas_por_test >= 20 and preguntas_por_test <= 30);
  end if;
end $$;

-- ============================================================
-- 2. preguntas: añadir justificacion y fuente (ambas nullables)
-- ============================================================
alter table preguntas
  add column if not exists justificacion text;

alter table preguntas
  add column if not exists fuente text;

-- ============================================================
-- 3. tests: snapshot preguntas_por_test (con backfill a 20)
-- ============================================================
alter table tests
  add column if not exists preguntas_por_test int;

update tests set preguntas_por_test = 20
  where preguntas_por_test is null;

alter table tests
  alter column preguntas_por_test set not null;

-- ============================================================
-- 4. Tabla de unión test_temas
-- ============================================================
create table if not exists test_temas (
  test_id uuid not null references tests(id) on delete cascade,
  tema_id uuid not null references temas(id),
  primary key (test_id, tema_id)
);

create index if not exists idx_test_temas_tema on test_temas(tema_id);

-- Backfill desde tests.tema_id existente (solo si la columna aún existe).
-- En la primera ejecución, copia las relaciones legacy 1:1 a la junction.
-- En reejecuciones, la columna ya no existe y el bloque se salta.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'tests' and column_name = 'tema_id'
  ) then
    insert into test_temas (test_id, tema_id)
      select id, tema_id from tests
      where tema_id is not null
      on conflict do nothing;
  end if;
end $$;

-- ============================================================
-- 5. tests.modalidad: extender enum de ('tema','asignatura') a ('temas','asignatura')
-- ============================================================

-- 5a. Drop dinámicamente cualquier check constraint sobre `modalidad`.
--     Su nombre puede variar (auto-generado al crear la tabla en Fase 2).
--     Esto también garantiza idempotencia: en reejecuciones drop la constraint
--     que añadió la propia migración la vez anterior.
do $$
declare
  cons_name text;
begin
  for cons_name in
    select c.conname
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where t.relname = 'tests'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%modalidad%'
  loop
    execute format('alter table tests drop constraint %I', cons_name);
  end loop;
end $$;

-- 5b. Migrar valores legacy ('tema' -> 'temas'). Sin la check constraint vieja,
--     el UPDATE no se rechaza por valor fuera del enum.
update tests set modalidad = 'temas' where modalidad = 'tema';

-- 5c. Añadir la nueva check constraint con el enum actualizado.
alter table tests add constraint tests_modalidad_check
  check (modalidad in ('temas','asignatura'));

-- 5d. Eliminar la columna tema_id (datos ya migrados a test_temas en paso 4).
alter table tests drop column if exists tema_id;

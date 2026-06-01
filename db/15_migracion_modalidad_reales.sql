-- QuizApp — migración Fase 13: modalidad 'reales'
-- Extiende tests.modalidad de ('temas','asignatura') a ('temas','asignatura','reales').
-- Idempotente: el drop dinámico elimina cualquier check sobre `modalidad` antes de re-crearlo
-- (su nombre puede variar — autogenerado al crear la tabla en Fase 2).

do $$
declare cons_name text;
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

alter table tests add constraint tests_modalidad_check
  check (modalidad in ('temas','asignatura','reales'));

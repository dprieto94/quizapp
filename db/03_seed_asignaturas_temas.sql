-- QuizApp — seed asignaturas y temas (PLACEHOLDER commiteable)
-- Distribución: 10 + 10 + 10 + 9 + 9 = 48 temas. Idempotente.
-- Los nombres reales viven en db/03_seed_asignaturas_temas.local.sql (gitignored).

do $$
declare
  v_asig uuid;
  i int;
  j int;
  cnt int[] := array[10, 10, 10, 9, 9];
begin
  for i in 1..5 loop
    insert into asignaturas (nombre, orden)
    select 'Asignatura ' || i, i
    where not exists (select 1 from asignaturas where orden = i);

    select id into v_asig from asignaturas where orden = i;

    for j in 1..cnt[i] loop
      insert into temas (asignatura_id, nombre, orden)
      select v_asig, 'Tema ' || j, j
      where not exists (
        select 1 from temas where asignatura_id = v_asig and orden = j
      );
    end loop;
  end loop;
end $$;

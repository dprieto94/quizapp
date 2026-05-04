-- QuizApp — seed config (Fase 2)
-- Una única fila con id=1 (singleton). Idempotente.

insert into config (id, penalizacion, timer_minutos)
values (1, 0.50, 45)
on conflict (id) do nothing;

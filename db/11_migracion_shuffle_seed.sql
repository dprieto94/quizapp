-- QuizApp — migración Fase 11.7: shuffle_seed por test
--
-- Idempotente: se puede ejecutar varias veces sin error.
--
-- Una columna nullable. Tests previos quedan con NULL y se renderizan sin shuffle
-- (comportamiento legacy). Tests nuevos reciben siempre seed desde la action
-- finalizarTest, lo que neutraliza el sesgo posicional a/b/c del banco generado
-- con LLM (a~45% / b~47% / c~7%).

alter table tests
  add column if not exists shuffle_seed uuid;

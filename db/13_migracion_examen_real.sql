-- QuizApp — migración: columna examen_real en preguntas
-- Marca si la pregunta procede de una pregunta real de examen / ejemplo físico.
-- Ejecutable en el SQL Editor de Supabase. Idempotente.
-- 'add column ... not null default false' deja TODAS las filas existentes en false.

alter table preguntas
  add column if not exists examen_real boolean not null default false;

comment on column preguntas.examen_real is
  'true = la pregunta procede de una pregunta real de examen / ejemplo fisico (p. ej. actividades de repaso de la guia de estudio); false = resto del banco';

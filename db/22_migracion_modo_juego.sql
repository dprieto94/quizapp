-- QuizApp — migración Fase 14: modo juego (clasificación por asignatura)
-- Tabla COMPARTIDA entre usuarios (no se filtra por user en lectura), análoga al
-- banco de contenido. Idempotente: create table/index if not exists.

create table if not exists juego_records (
  id              uuid primary key default gen_random_uuid(),
  asignatura_id   uuid not null references asignaturas(id) on delete cascade,
  user_id         uuid references users(id) on delete cascade,    -- null = record fake/seed
  nombre          text not null,                                  -- nombre mostrado en el ranking
  aciertos        int  not null check (aciertos >= 0),            -- puntuación = nº de aciertos
  vidas_iniciales int  not null check (vidas_iniciales between 1 and 3),
  modalidad       text not null check (modalidad in ('asignatura','reales')),  -- pool jugada (total | examen real)
  es_fake         boolean not null default false,
  premio          text,                                           -- solo el record-con-premio (Anna, asig 1)
  fecha           timestamptz default now()
);

-- Ordenación del ranking: por asignatura, mejor puntuación primero, desempate por antigüedad.
create index if not exists idx_juego_records_ranking
  on juego_records(asignatura_id, aciertos desc, fecha asc);

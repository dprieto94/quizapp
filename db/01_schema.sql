-- QuizApp — schema (Fase 2)
-- Doc Técnico §5.1–5.2

create extension if not exists "pgcrypto";

-- Usuaria única (1 fila)
create table users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);

-- Configuración global (1 fila, id = 1)
create table config (
  id              int primary key default 1,
  penalizacion    numeric(3,2) not null default 0.50,
  timer_minutos   int not null default 45,
  check (penalizacion >= 0 and penalizacion <= 1),
  check (timer_minutos > 0 and timer_minutos <= 600)
);

create table asignaturas (
  id      uuid primary key default gen_random_uuid(),
  nombre  text not null,
  orden   int not null
);

create table temas (
  id            uuid primary key default gen_random_uuid(),
  asignatura_id uuid not null references asignaturas(id) on delete cascade,
  nombre        text not null,
  orden         int not null
);

create table preguntas (
  id          uuid primary key default gen_random_uuid(),
  tema_id     uuid not null references temas(id) on delete cascade,
  enunciado   text not null,
  opcion_a    text not null,
  opcion_b    text not null,
  opcion_c    text not null,
  correcta    char(1) not null check (correcta in ('a','b','c')),
  created_at  timestamptz default now()
);

create table tests (
  id             uuid primary key default gen_random_uuid(),
  fecha          timestamptz default now(),
  modo           text not null check (modo in ('examen','estudio')),
  modalidad      text not null check (modalidad in ('tema','asignatura')),
  asignatura_id  uuid not null references asignaturas(id),
  tema_id        uuid references temas(id),
  penalizacion   numeric(3,2) not null,
  timer_minutos  int,
  aciertos       int not null,
  fallos         int not null,
  blancos        int not null,
  nota           numeric(4,2)
);

create table test_respuestas (
  id              uuid primary key default gen_random_uuid(),
  test_id         uuid not null references tests(id) on delete cascade,
  pregunta_id     uuid not null references preguntas(id),
  opcion_marcada  char(1) check (opcion_marcada in ('a','b','c')),
  fue_dudosa      boolean not null default false,
  orden           int not null
);

-- Índices secundarios
create index idx_temas_asignatura      on temas(asignatura_id, orden);
create index idx_preguntas_tema        on preguntas(tema_id);
create index idx_tests_fecha           on tests(fecha desc);
create index idx_tests_asignatura      on tests(asignatura_id);
create index idx_test_respuestas_test  on test_respuestas(test_id, orden);

export type Modo = "examen" | "estudio";
export type Modalidad = "tema" | "asignatura";
export type Opcion = "a" | "b" | "c";

export type User = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string | null;
};

export type Config = {
  id: number;
  penalizacion: number;
  timer_minutos: number;
};

export type Asignatura = {
  id: string;
  nombre: string;
  orden: number;
};

export type Tema = {
  id: string;
  asignatura_id: string;
  nombre: string;
  orden: number;
};

export type Pregunta = {
  id: string;
  tema_id: string;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  correcta: Opcion;
  created_at: string | null;
};

export type Test = {
  id: string;
  fecha: string | null;
  modo: Modo;
  modalidad: Modalidad;
  asignatura_id: string;
  tema_id: string | null;
  penalizacion: number;
  timer_minutos: number | null;
  aciertos: number;
  fallos: number;
  blancos: number;
  nota: number | null;
};

export type TestRespuesta = {
  id: string;
  test_id: string;
  pregunta_id: string;
  opcion_marcada: Opcion | null;
  fue_dudosa: boolean;
  orden: number;
};

export type NewAsignatura = { nombre: string; orden?: number };
export type UpdateAsignatura = Partial<Pick<Asignatura, "nombre" | "orden">>;
export type NewTema = { asignatura_id: string; nombre: string; orden?: number };
export type UpdateTema = Partial<Pick<Tema, "asignatura_id" | "nombre" | "orden">>;
export type NewPregunta = Omit<Pregunta, "id" | "created_at">;
export type UpdatePregunta = Partial<Omit<Pregunta, "id" | "created_at">>;
export type NewTest = Omit<Test, "id" | "fecha">;
export type NewTestRespuesta = Omit<TestRespuesta, "id">;

export type ConfigUpdate = Pick<Config, "penalizacion" | "timer_minutos">;

export type AsignaturaWithCounts = Asignatura & {
  temas_count: number;
  preguntas_count: number;
};

export type TemaWithAsignatura = Tema & {
  asignatura_nombre: string;
};

export type TemaWithCounts = TemaWithAsignatura & {
  preguntas_count: number;
};

export type PreguntaWithContext = Pregunta & {
  tema_nombre: string;
  asignatura_id: string;
  asignatura_nombre: string;
};

export type PreguntaFilters = {
  asignaturaId?: string;
  temaId?: string;
  q?: string;
};

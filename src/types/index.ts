export type Modo = "examen" | "estudio";
export type Modalidad = "temas" | "asignatura";
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
  preguntas_por_test: number;
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
  justificacion: string | null;
  fuente: string | null;
  created_at: string | null;
};

export type Test = {
  id: string;
  fecha: string | null;
  modo: Modo;
  modalidad: Modalidad;
  asignatura_id: string;
  preguntas_por_test: number;
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

export type ConfigUpdate = Pick<
  Config,
  "penalizacion" | "timer_minutos" | "preguntas_por_test"
>;

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

export type PreguntaConTema = Pregunta & { tema_nombre: string };

export type PreguntaPublica = Omit<PreguntaConTema, "correcta" | "created_at">;

export type CorrectasMap = Record<string, Opcion>;

export type RespuestaEntrega = {
  pregunta_id: string;
  opcion_marcada: Opcion | null;
  fue_dudosa: boolean;
  orden: number;
};

export type CreateTestWithRespuestasInput = Omit<Test, "id" | "fecha"> & {
  tema_ids: string[];
  respuestas: RespuestaEntrega[];
};

export type CorrectaPregunta = Pick<Pregunta, "id" | "tema_id" | "correcta"> & {
  asignatura_id: string;
};

export type TestRespuestaDetalle = TestRespuesta & {
  pregunta: PreguntaConTema;
};

export type TestDetalle = Test & {
  asignatura_nombre: string;
  temas: Array<{ id: string; nombre: string; orden: number }>;
  respuestas: TestRespuestaDetalle[];
};

export type TestListaItem = {
  id: string;
  fecha: string;
  modo: Modo;
  modalidad: Modalidad;
  asignatura_id: string;
  asignatura_nombre: string;
  asignatura_orden: number;
  temas: Array<{ id: string; nombre: string; orden: number }>;
  preguntas_por_test: number;
  aciertos: number;
  fallos: number;
  blancos: number;
  nota: number | null;
};

export type TestFilters = {
  asignaturaId?: string;
  modo?: Modo;
  desde?: string;
  hasta?: string;
};

export type MediaPorAsignaturaItem = {
  asignatura_id: string;
  asignatura_nombre: string;
  asignatura_orden: number;
  media: number;
  n_tests: number;
};

export type TestEvolucionPunto = {
  test_id: string;
  fecha: string;
  nota: number;
  asignatura_nombre: string;
  modalidad: Modalidad;
};

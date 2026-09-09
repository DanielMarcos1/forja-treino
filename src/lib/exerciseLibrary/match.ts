export type LibItem = { s: string; m: string };

export type ExerciseMatch = {
  slug: string;
  muscle: string;
  gifUrl: string;
  score: number;
};

const CDN = "https://cdn.jsdelivr.net/gh/jahelcuadrado/ExerciseGymGifsDB@main";

export function gifUrlFor(muscle: string, slug: string) {
  return `${CDN}/${muscle}/${slug}.gif`;
}

/** Words that add no discriminating value when matching exercise names. */
const STOP = new Set([
  "the","a","an","of","with","and","on","in","to","for","your","de","da","do","dos","das",
  "com","e","em","no","na","nos","nas","um","uma","o","os","as","el","la","los","las","y",
  "con","del","al","le","les","du","des","et","avec","sur","au","aux","exercicio","exercise",
  "ejercicio","exercice","reto","alternado","alternating","variation",
]);

/** Cross-language vocabulary mapped onto the English slugs used by the library. */
const SYNONYMS: Record<string, string> = {
  // equipment
  barra: "barbell", barbell: "barbell", halter: "dumbbell", halteres: "dumbbell",
  haltere: "dumbbell", mancuerna: "dumbbell", mancuernas: "dumbbell", haltere_: "dumbbell",
  dumbbell: "dumbbell", dumbbells: "dumbbell", altere: "dumbbell", altères: "dumbbell",
  cabo: "cable", cabos: "cable", polia: "cable", poulie: "cable", polea: "cable",
  maquina: "lever", máquina: "lever", machine: "lever", aparelho: "lever",
  smith: "smith", kettlebell: "kettlebell", elastico: "band", elástico: "band",
  faixa: "band", banda: "band", band: "band", bola: "stability", suico: "stability",
  suíço: "stability", corda: "rope", rope: "rope", anilha: "weighted", peso: "weighted",
  // movements
  supino: "bench-press", press: "press", pressa: "press", crucifixo: "fly", fly: "fly",
  flye: "fly", apertura: "fly", crossover: "crossover", agachamento: "squat",
  sentadilla: "squat", squat: "squat", accroupissement: "squat", leg: "leg",
  levantamento: "deadlift", terra: "deadlift", deadlift: "deadlift", peso_morto: "deadlift",
  remada: "row", remo: "row", row: "row", rowing: "row", puxada: "pulldown",
  pulldown: "pulldown", jalon: "pulldown", barrafixa: "pull-up", pullup: "pull-up",
  pullover: "pullover", rosca: "curl", curl: "curl", flexion: "curl", biceps: "curl",
  triceps: "triceps", tricep: "triceps", testa: "skullcrusher", frances: "skullcrusher",
  francês: "skullcrusher", mergulho: "dip", paralelas: "dip", dip: "dip", dips: "dip",
  flexao: "push-up", flexão: "push-up", flexoes: "push-up", flexiones: "push-up",
  pompes: "push-up", pushup: "push-up", desenvolvimento: "shoulder-press",
  elevacao: "raise", elevação: "raise", elevacion: "raise", elevation: "raise",
  raise: "raise", lateral: "lateral", frontal: "front", posterior: "rear",
  encolhimento: "shrug", shrug: "shrug", afundo: "lunge", avanco: "lunge",
  avanço: "lunge", passada: "lunge", lunge: "lunge", zancada: "lunge", fente: "lunge",
  extensora: "leg-extension", flexora: "leg-curl", panturrilha: "calf", calf: "calf",
  gemelo: "calf", mollet: "calf", abdominal: "crunch", abdominais: "crunch",
  crunch: "crunch", abdominaux: "crunch", prancha: "plank", plancha: "plank",
  planche: "plank", plank: "plank", ponte: "bridge", bridge: "bridge",
  gluteo: "glute", glúteo: "glute", gluteos: "glute", glute: "glute",
  stiff: "stiff-leg", bulgaro: "bulgarian", búlgaro: "bulgarian",
  inclinado: "incline", inclinada: "incline", incline: "incline",
  declinado: "decline", declinada: "decline", decline: "decline",
  sentado: "seated", sentada: "seated", seated: "seated", assis: "seated",
  deitado: "lying", deitada: "lying", lying: "lying", tumbado: "lying",
  em_pe: "standing", standing: "standing", debout: "standing", parado: "standing",
  unilateral: "one-arm", "1": "one", corrida: "run", caminhada: "walk",
  esteira: "treadmill", bicicleta: "bike", eliptico: "elliptical", elíptico: "elliptical",
  remador: "rower", pular: "jump", jump: "jump", salto: "jump", burpee: "burpee",
  abducao: "abduction", abdução: "abduction", aducao: "adduction", adução: "adduction",
  ombro: "shoulder", ombros: "shoulder", peito: "chest", peitoral: "chest",
  costas: "back", perna: "leg", pernas: "leg", coxa: "thigh", quadril: "hip",
  antebraco: "forearm", antebraço: "forearm", punho: "wrist", pescoco: "neck",
  alongamento: "stretch", stretch: "stretch", estiramiento: "stretch",
  martelo: "hammer", hammer: "hammer", concentrada: "concentration",
  scott: "preacher", preacher: "preacher", arnold: "arnold", face: "face",
  hip_thrust: "hip-thrust", thrust: "thrust", terrestre: "deadlift",
};

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(input: string): string[] {
  const out: string[] = [];
  for (const raw of normalize(input).split(" ")) {
    if (!raw) continue;
    const mapped = SYNONYMS[raw];
    if (mapped) {
      for (const piece of mapped.split("-")) out.push(piece);
      continue;
    }
    if (STOP.has(raw) || raw.length < 2) continue;
    out.push(raw);
  }
  return out;
}

function slugTokens(slug: string): string[] {
  return slug.split("-").filter((w) => w.length > 1 && !STOP.has(w));
}

function score(query: string[], candidate: string[]): number {
  if (!query.length || !candidate.length) return 0;
  const cand = new Set(candidate);
  let hit = 0;
  for (const q of new Set(query)) {
    if (cand.has(q)) hit += 1;
    else if ([...cand].some((c) => c.startsWith(q) || q.startsWith(c))) hit += 0.6;
  }
  const coverage = hit / new Set(query).size;
  const precision = hit / cand.size;
  return coverage * 0.72 + precision * 0.28;
}

let cache: LibItem[] | null = null;

async function loadLibrary(): Promise<LibItem[]> {
  if (!cache) {
    const mod = await import("./index.json");
    cache = (mod.default ?? mod) as LibItem[];
  }
  return cache;
}

/**
 * Finds the best animated demonstration for an exercise.
 * `nameEn` is the canonical English name returned by the AI; `name` is the
 * localized name shown to the user (used as fallback for older saved workouts).
 */
export async function findExerciseGif(
  name: string,
  nameEn?: string,
): Promise<ExerciseMatch | null> {
  const lib = await loadLibrary();
  const queries = [nameEn, name].filter(Boolean) as string[];

  let best: ExerciseMatch | null = null;
  for (const q of queries) {
    const tokens = tokenize(q);
    if (!tokens.length) continue;
    const exactSlug = normalize(q).replace(/ /g, "-");
    for (const item of lib) {
      const s = item.s === exactSlug ? 1 : score(tokens, slugTokens(item.s));
      if (!best || s > best.score) {
        best = { slug: item.s, muscle: item.m, gifUrl: gifUrlFor(item.m, item.s), score: s };
      }
    }
    if (best && best.score >= 0.9) break;
  }

  return best && best.score >= 0.5 ? best : null;
}

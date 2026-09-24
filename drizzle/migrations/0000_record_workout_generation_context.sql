ALTER TABLE public.workout_generations
  ADD COLUMN local TEXT,
  ADD COLUMN objetivo TEXT;

ALTER TABLE public.workout_generations
  ADD CONSTRAINT workout_generations_local_check
    CHECK (local IS NULL OR local IN ('academia', 'casa_equipamentos', 'casa_sem_equipamentos', 'ar_livre', 'casa', 'outro')),
  ADD CONSTRAINT workout_generations_objetivo_check
    CHECK (objetivo IS NULL OR objetivo IN ('hipertrofia', 'emagrecimento', 'condicionamento', 'forca', 'força', 'mobilidade', 'resistencia', 'resistência'));

COMMENT ON COLUMN public.workout_generations.local IS 'Local de treino canônico usado na geração; registros antigos permanecem nulos.';
COMMENT ON COLUMN public.workout_generations.objetivo IS 'Objetivo canônico usado na geração; registros antigos permanecem nulos.';
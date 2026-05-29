CREATE TABLE public.workout_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_generations_user_created ON public.workout_generations (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.workout_generations TO authenticated;
GRANT ALL ON public.workout_generations TO service_role;

ALTER TABLE public.workout_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations"
ON public.workout_generations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
ON public.workout_generations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
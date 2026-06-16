CREATE TABLE public.saved_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  dias_por_semana INTEGER NOT NULL DEFAULT 0,
  duracao_min INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_workouts TO authenticated;
GRANT ALL ON public.saved_workouts TO service_role;

ALTER TABLE public.saved_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved workouts" ON public.saved_workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved workouts" ON public.saved_workouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved workouts" ON public.saved_workouts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved workouts" ON public.saved_workouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX saved_workouts_user_created_idx ON public.saved_workouts (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_saved_workouts_updated_at
  BEFORE UPDATE ON public.saved_workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
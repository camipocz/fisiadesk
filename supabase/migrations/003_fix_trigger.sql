-- ============================================================
-- Fix: Trigger handle_new_user — com search_path e exception handling
-- Cole e execute este SQL no Supabase SQL Editor
-- ============================================================

-- Drop trigger e função anteriores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recria a função com search_path explícito e exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cria perfil do profissional
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Cria preferências de notificação padrão
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Cria horários disponíveis padrão: seg–sex, 8h–19h
  INSERT INTO public.available_hours (user_id, day_of_week, hour, enabled)
  SELECT
    NEW.id,
    days.d,
    hours.h,
    TRUE
  FROM
    (SELECT generate_series(1, 5) AS d) AS days,
    (SELECT generate_series(8, 19) AS h) AS hours
  ON CONFLICT (user_id, day_of_week, hour) DO NOTHING;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Loga o erro mas não bloqueia a criação do usuário
    RAISE WARNING 'handle_new_user falhou para user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recria o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Confirma
SELECT 'Trigger recriado com sucesso ✅' AS status;

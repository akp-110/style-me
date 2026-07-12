-- Fix signup failures caused by the auth.users subscription trigger.
--
-- Auth trigger functions should not depend on the caller's search_path. Fully
-- qualifying public objects also ensures the function resolves the intended
-- table and enum while Supabase Auth is creating a user.
CREATE OR REPLACE FUNCTION public.create_subscription_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_subscriptions (user_id, tier)
    VALUES (NEW.id, 'free'::public.subscription_tier)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;

CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_subscription_for_new_user();

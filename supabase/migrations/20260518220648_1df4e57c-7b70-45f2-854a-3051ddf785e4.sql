-- Remove subscription and device tracking
DROP TABLE IF EXISTS public.user_devices CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.device_sessions CASCADE;
DROP FUNCTION IF EXISTS public.can_add_device(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_device_access() CASCADE;
DROP FUNCTION IF EXISTS public.check_device_limit(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_device_limit_for_tier(subscription_tier) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_subscription() CASCADE;
DROP FUNCTION IF EXISTS public.register_device_session(uuid, text, text, jsonb) CASCADE;
DROP TYPE IF EXISTS public.subscription_tier CASCADE;
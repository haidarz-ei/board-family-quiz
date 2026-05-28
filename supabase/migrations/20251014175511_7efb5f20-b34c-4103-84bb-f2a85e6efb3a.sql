-- Drop trigger first, then function
DROP TRIGGER IF EXISTS update_device_last_access ON public.user_devices;
DROP FUNCTION IF EXISTS public.update_device_access();

-- Recreate function with correct search_path
CREATE OR REPLACE FUNCTION public.update_device_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_device_last_access
BEFORE UPDATE ON public.user_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_device_access();
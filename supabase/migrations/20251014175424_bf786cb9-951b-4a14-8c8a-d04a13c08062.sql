-- Create user_devices table for device tracking
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Enable RLS
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own devices
CREATE POLICY "Users can view their own devices"
ON public.user_devices
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own devices
CREATE POLICY "Users can insert their own devices"
ON public.user_devices
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own devices
CREATE POLICY "Users can update their own devices"
ON public.user_devices
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own devices
CREATE POLICY "Users can delete their own devices"
ON public.user_devices
FOR DELETE
USING (auth.uid() = user_id);

-- Function to check if user can add more devices
CREATE OR REPLACE FUNCTION public.can_add_device(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_devices INTEGER;
  v_device_limit INTEGER;
BEGIN
  -- Get current device count
  SELECT COUNT(*) INTO v_current_devices
  FROM public.user_devices
  WHERE user_id = p_user_id;
  
  -- Get device limit for user
  SELECT device_limit INTO v_device_limit
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, use free tier limit (1 device)
  IF v_device_limit IS NULL THEN
    v_device_limit := 1;
  END IF;
  
  RETURN v_current_devices < v_device_limit;
END;
$$;

-- Function to auto-update last_accessed_at
CREATE OR REPLACE FUNCTION public.update_device_access()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to update last_accessed_at on update
CREATE TRIGGER update_device_last_access
BEFORE UPDATE ON public.user_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_device_access();

-- Create index for better performance
CREATE INDEX idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX idx_user_devices_last_accessed ON public.user_devices(last_accessed_at DESC);
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('free', 'login', 'paid', 'premium');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get device limit based on tier
CREATE OR REPLACE FUNCTION public.get_device_limit_for_tier(p_tier subscription_tier)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_tier
    WHEN 'free' THEN 1
    WHEN 'login' THEN 2
    WHEN 'paid' THEN 3
    WHEN 'premium' THEN 5
    ELSE 1
  END;
END;
$$;

-- Update check_device_limit to use user_subscriptions
CREATE OR REPLACE FUNCTION public.check_device_limit(
  p_user_id UUID,
  p_device_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_device_count INTEGER;
  v_max_devices INTEGER;
  v_tier subscription_tier;
  v_is_current_device BOOLEAN;
BEGIN
  -- Get user's tier
  SELECT tier INTO v_tier
  FROM user_subscriptions
  WHERE user_id = p_user_id AND is_active = true
  LIMIT 1;
  
  -- Default to 'login' if no subscription found (authenticated users)
  IF v_tier IS NULL THEN
    v_tier := 'login';
  END IF;
  
  -- Get device limit for tier
  v_max_devices := get_device_limit_for_tier(v_tier);
  
  -- Check if current device is already registered
  SELECT EXISTS(
    SELECT 1 FROM device_sessions 
    WHERE user_id = p_user_id AND device_id = p_device_id
  ) INTO v_is_current_device;
  
  -- Count active devices
  SELECT COUNT(*) INTO v_device_count
  FROM device_sessions
  WHERE user_id = p_user_id;
  
  -- Return result
  RETURN jsonb_build_object(
    'allowed', v_is_current_device OR v_device_count < v_max_devices,
    'current_count', v_device_count,
    'max_devices', v_max_devices,
    'tier', v_tier,
    'is_current_device', v_is_current_device
  );
END;
$$;

-- Trigger to create default subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (NEW.id, 'login');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Create index for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON public.user_subscriptions(tier);

-- Update timestamp trigger
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
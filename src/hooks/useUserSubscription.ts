import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SubscriptionTier = 'free' | 'login' | 'paid' | 'premium';

interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } else {
      setSubscription(data);
    }
    setLoading(false);
  };

  const getDeviceLimit = () => {
    if (!subscription) return 2; // Default for logged-in users
    
    const limits = {
      free: 1,
      login: 2,
      paid: 3,
      premium: 5
    };
    
    return limits[subscription.tier] || 2;
  };

  const getTierLabel = () => {
    if (!subscription) return 'Login';
    
    const labels = {
      free: 'Free',
      login: 'Login',
      paid: 'Paid',
      premium: 'Premium'
    };
    
    return labels[subscription.tier] || 'Login';
  };

  const getTierColor = () => {
    if (!subscription) return 'text-muted-foreground';
    
    const colors = {
      free: 'text-muted-foreground',
      login: 'text-blue-500',
      paid: 'text-green-500',
      premium: 'text-purple-500'
    };
    
    return colors[subscription.tier] || 'text-muted-foreground';
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    fetchSubscription,
    getDeviceLimit,
    getTierLabel,
    getTierColor,
    tier: subscription?.tier || 'login'
  };
};

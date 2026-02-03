// ============================================
// TYPE DEFINITIONS FOR BACKEND
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Subscription {
  status: SubscriptionStatus;
  plan: 'free' | 'premium' | null;
  lemonSqueezyId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  variantId: string | null;
  currentPeriodEnd: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  createdAt: FirebaseFirestore.Timestamp | null;
  updatedAt: FirebaseFirestore.Timestamp | null;
}

export type SubscriptionStatus = 'free' | 'active' | 'cancelled' | 'expired' | 'past_due';

export interface UserDocument {
  email: string;
  name: string;
  subscription: Subscription;
  usage: Usage;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Usage {
  count: number;
  resetDate: string;
}

export interface SubscriptionEvent {
  userId: string;
  event: string;
  data: Record<string, unknown>;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Payment {
  userId: string;
  status: 'success' | 'failed';
  amount?: number;
  currency?: string;
  data: Record<string, unknown>;
  createdAt: FirebaseFirestore.Timestamp;
}

// Lemon Squeezy Webhook Types
export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: LemonSqueezyAttributes;
  };
}

export interface LemonSqueezyAttributes {
  store_id: number;
  customer_id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  user_name: string;
  user_email: string;
  status: string;
  status_formatted: string;
  card_brand: string | null;
  card_last_four: string | null;
  pause: unknown | null;
  cancelled: boolean;
  trial_ends_at: string | null;
  billing_anchor: number;
  first_subscription_item: {
    id: number;
    subscription_id: number;
    price_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
  };
  urls: {
    update_payment_method: string;
    customer_portal: string;
  };
  renews_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
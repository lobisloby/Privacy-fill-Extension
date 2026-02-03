import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { verifyWebhookSignature, getConfig, createResponse } from '../utils/helpers';
import { updateSubscription, logSubscriptionEvent, logPayment } from './subscriptions';
import { LemonSqueezyWebhookPayload, LemonSqueezyAttributes } from '../types';

/**
 * Handle Lemon Squeezy webhook
 */
export async function handleLemonSqueezyWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Get webhook secret
    let webhookSecret: string;
    try {
      webhookSecret = getConfig('lemonsqueezy.webhook_secret');
    } catch {
      console.error('Webhook secret not configured');
      res.status(500).json(createResponse(false, undefined, 'Webhook secret not configured'));
      return;
    }

    // Verify signature
    const signature = req.headers['x-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      res.status(401).json(createResponse(false, undefined, 'Invalid signature'));
      return;
    }

    const payload = req.body as LemonSqueezyWebhookPayload;
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};
    const userId = customData.user_id;

    if (!userId) {
      console.error('No user_id in webhook custom_data');
      res.status(400).json(createResponse(false, undefined, 'Missing user_id'));
      return;
    }

    console.log(`Processing webhook: ${eventName} for user: ${userId}`);

    const attributes = payload.data.attributes;

    // Handle different event types
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(userId, payload.data.id, attributes);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(userId, attributes);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(userId, attributes);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(userId, attributes);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(userId, attributes);
        break;

      case 'subscription_paused':
        await handleSubscriptionPaused(userId, attributes);
        break;

      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(userId, attributes);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(userId, attributes);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(userId, attributes);
        break;

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    res.json(createResponse(true, { received: true }));
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json(createResponse(false, undefined, 'Webhook processing failed'));
  }
}

/**
 * Handle subscription_created event
 */
async function handleSubscriptionCreated(
  userId: string,
  subscriptionId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await updateSubscription(userId, {
    status: 'active',
    plan: 'premium',
    lemonSqueezyId: subscriptionId,
    subscriptionId: String(attributes.first_subscription_item?.subscription_id || subscriptionId),
    customerId: String(attributes.customer_id),
    variantId: String(attributes.variant_id),
    currentPeriodEnd: attributes.renews_at,
    expiresAt: attributes.renews_at,
    createdAt: admin.firestore.Timestamp.now(),
  });

  await logSubscriptionEvent(userId, 'subscription_created', attributes as unknown as Record<string, unknown>);
}

/**
 * Handle subscription_updated event
 */
async function handleSubscriptionUpdated(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  const status = attributes.cancelled ? 'cancelled' : 'active';
  
  await updateSubscription(userId, {
    status,
    currentPeriodEnd: attributes.renews_at,
    expiresAt: attributes.ends_at || attributes.renews_at,
  });

  await logSubscriptionEvent(userId, 'subscription_updated', attributes as unknown as Record<string, unknown>);
}

/**
 * Handle subscription_cancelled event
 */
async function handleSubscriptionCancelled(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await updateSubscription(userId, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    expiresAt: attributes.ends_at,
  });

  await logSubscriptionEvent(userId, 'subscription_cancelled', attributes as unknown as Record<string, unknown>);
}

/**
 * Handle subscription_resumed event
 */
async function handleSubscriptionResumed(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await updateSubscription(userId, {
    status: 'active',
    cancelledAt: null,
    expiresAt: attributes.renews_at,
  });

  await logSubscriptionEvent(userId, 'subscription_resumed', attributes as unknown as Record<string, unknown>);
}

/**
 * Handle subscription_expired event
 */
async function handleSubscriptionExpired(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await updateSubscription(userId, {
    status: 'expired',
    plan: 'free',
  });

  await logSubscriptionEvent(userId, 'subscription_expired', attributes as unknown as Record<string, unknown>);
}

/**
 * Handle subscription_paused event
 */
async function handleSubscriptionPaused(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await updateSubscription(userId, {
    status: 'cancelled', // Treat paused as cancelled for simplicity
  });

  await logSubscriptionEvent(userId, 'subscription_paused', attributes as unknown as Record<string, unknown>);
}

/**
 * Handle subscription_unpaused event
 */
async function handleSubscriptionUnpaused(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await updateSubscription(userId, {
    status: 'active',
    expiresAt: attributes.renews_at,
  });

  await logSubscriptionEvent(userId, 'subscription_unpaused', attributes as unknown as Record<string, unknown>);
}

/**
 * Handle subscription_payment_success event
 */
async function handlePaymentSuccess(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await logPayment(userId, 'success', attributes as unknown as Record<string, unknown>);
  
  // Ensure subscription is active after successful payment
  await updateSubscription(userId, {
    status: 'active',
    expiresAt: attributes.renews_at,
  });
}

/**
 * Handle subscription_payment_failed event
 */
async function handlePaymentFailed(
  userId: string,
  attributes: LemonSqueezyAttributes
): Promise<void> {
  await logPayment(userId, 'failed', attributes as unknown as Record<string, unknown>);

  await updateSubscription(userId, {
    status: 'past_due',
  });

  await logSubscriptionEvent(userId, 'payment_failed', attributes as unknown as Record<string, unknown>);
}
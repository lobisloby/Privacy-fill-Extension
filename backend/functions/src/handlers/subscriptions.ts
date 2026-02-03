import * as admin from 'firebase-admin';
import { Response } from 'express';
import { createResponse, isExpired, shouldResetUsage } from '../utils/helpers';
import { UserDocument, Subscription } from '../types';

const db = admin.firestore();

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(
  userId: string,
  res: Response
): Promise<void> {
  try {
    if (!userId) {
      res.status(400).json(createResponse(false, undefined, 'Missing userId'));
      return;
    }

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json(createResponse(false, undefined, 'User not found'));
      return;
    }

    const userData = userDoc.data() as UserDocument;
    let subscription = userData.subscription;

    // Check if subscription has expired
    if (subscription.status === 'active' && isExpired(subscription.expiresAt)) {
      subscription = {
        ...subscription,
        status: 'expired',
      };
      
      // Update in database
      await db.collection('users').doc(userId).update({
        'subscription.status': 'expired',
        'subscription.updatedAt': admin.firestore.Timestamp.now(),
      });
    }

    res.json(createResponse(true, { subscription }));
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json(createResponse(false, undefined, 'Internal server error'));
  }
}

/**
 * Track usage for a user
 */
export async function trackUsage(userId: string, res: Response): Promise<void> {
  try {
    if (!userId) {
      res.status(400).json(createResponse(false, undefined, 'Missing userId'));
      return;
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json(createResponse(false, undefined, 'User not found'));
      return;
    }

    const userData = userDoc.data() as UserDocument;
    let { count, resetDate } = userData.usage;
    let wasReset = false;

    // Check if usage should be reset (monthly)
    if (shouldResetUsage(resetDate)) {
      count = 0;
      resetDate = new Date().toISOString();
      wasReset = true;
    }

    // Increment usage
    const newCount = count + 1;

    await userRef.update({
      'usage.count': newCount,
      'usage.resetDate': resetDate,
    });

    res.json(createResponse(true, { count: newCount, reset: wasReset }));
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json(createResponse(false, undefined, 'Internal server error'));
  }
}

/**
 * Update subscription status (internal use)
 */
export async function updateSubscription(
  userId: string,
  subscriptionData: Partial<Subscription>
): Promise<void> {
  const updateData: Record<string, unknown> = {
    'subscription.updatedAt': admin.firestore.Timestamp.now(),
  };

  for (const [key, value] of Object.entries(subscriptionData)) {
    updateData[`subscription.${key}`] = value;
  }

  await db.collection('users').doc(userId).update(updateData);
}

/**
 * Log subscription event
 */
export async function logSubscriptionEvent(
  userId: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  await db.collection('subscription_events').add({
    userId,
    event,
    data,
    createdAt: admin.firestore.Timestamp.now(),
  });
}

/**
 * Log payment
 */
export async function logPayment(
  userId: string,
  status: 'success' | 'failed',
  data: Record<string, unknown>
): Promise<void> {
  await db.collection('payments').add({
    userId,
    status,
    amount: data.total as number | undefined,
    currency: data.currency as string | undefined,
    data,
    createdAt: admin.firestore.Timestamp.now(),
  });
}
import * as admin from 'firebase-admin';
import { Response } from 'express';
import { createResponse } from '../utils/helpers';
import { UserDocument, Subscription } from '../types';

const db = admin.firestore();

/**
 * Default subscription for new users
 */
const defaultSubscription: Subscription = {
  status: 'free',
  plan: 'free',
  lemonSqueezyId: null,
  subscriptionId: null,
  customerId: null,
  variantId: null,
  currentPeriodEnd: null,
  expiresAt: null,
  cancelledAt: null,
  createdAt: null,
  updatedAt: null,
};

/**
 * Register a new user or return existing user
 */
export async function registerUser(
  userId: string,
  email: string,
  name: string,
  res: Response
): Promise<void> {
  try {
    if (!userId || !email) {
      res.status(400).json(createResponse(false, undefined, 'Missing required fields: userId, email'));
      return;
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // User already exists, return existing data
      const userData = userDoc.data() as UserDocument;
      res.json(createResponse(true, { 
        userId, 
        isNew: false,
        subscription: userData.subscription 
      }));
      return;
    }

    // Create new user
    const now = admin.firestore.Timestamp.now();
    const newUser: UserDocument = {
      email,
      name: name || email.split('@')[0],
      subscription: defaultSubscription,
      usage: {
        count: 0,
        resetDate: new Date().toISOString(),
      },
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(newUser);

    res.json(createResponse(true, { 
      userId, 
      isNew: true,
      subscription: defaultSubscription 
    }));
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json(createResponse(false, undefined, 'Internal server error'));
  }
}

/**
 * Get user by ID
 */
export async function getUser(userId: string, res: Response): Promise<void> {
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
    res.json(createResponse(true, { 
      userId,
      email: userData.email,
      name: userData.name,
      subscription: userData.subscription,
      usage: userData.usage,
    }));
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json(createResponse(false, undefined, 'Internal server error'));
  }
}
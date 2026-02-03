import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Import handlers
import { registerUser, getUser } from './handlers/users';
import { getSubscriptionStatus, trackUsage } from './handlers/subscriptions';
import { handleLemonSqueezyWebhook } from './handlers/webhooks';

// CORS configuration
const corsMiddleware = cors({ origin: true });

// Helper to wrap handlers with CORS
function withCors(
  handler: (req: functions.https.Request, res: functions.Response) => Promise<void> | void
) {
  return (req: functions.https.Request, res: functions.Response) => {
    corsMiddleware(req, res, () => {
      handler(req, res);
    });
  };
}

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * Register a new user
 * POST /registerUser
 * Body: { userId, email, name }
 */
export const registerUserFn = functions.https.onRequest(
  withCors(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    const { userId, email, name } = req.body;
    await registerUser(userId, email, name, res);
  })
);

/**
 * Get user details
 * GET /getUser?userId=xxx
 */
export const getUserFn = functions.https.onRequest(
  withCors(async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    const userId = req.query.userId as string;
    await getUser(userId, res);
  })
);

// ============================================
// SUBSCRIPTION ENDPOINTS
// ============================================

/**
 * Get subscription status
 * GET /getSubscriptionStatus?userId=xxx
 */
export const getSubscriptionStatusFn = functions.https.onRequest(
  withCors(async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    const userId = req.query.userId as string;
    await getSubscriptionStatus(userId, res);
  })
);

/**
 * Track usage
 * POST /trackUsage
 * Body: { userId }
 */
export const trackUsageFn = functions.https.onRequest(
  withCors(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    const { userId } = req.body;
    await trackUsage(userId, res);
  })
);

// ============================================
// WEBHOOK ENDPOINTS
// ============================================

/**
 * Lemon Squeezy webhook handler
 * POST /lemonSqueezyWebhook
 */
export const lemonSqueezyWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  await handleLemonSqueezyWebhook(req, res);
});

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Health check endpoint
 * GET /health
 */
export const health = functions.https.onRequest(
  withCors((req, res) => {
    res.json({
      success: true,
      message: 'PrivacyFill API is running',
      timestamp: new Date().toISOString(),
    });
  })
);
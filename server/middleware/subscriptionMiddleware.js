// server/middleware/subscriptionMiddleware.js

import Subscription from '../models/Subscription.js';

export const checkActiveSubscription = async (req, res, next) => {
  try {
    // 1. Check for active paid subscription
    const subscription = await Subscription.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (subscription) {
      req.subscription = subscription;
      return next();
    }

    // 2. Check for free trial (30 days)
    const trialDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    const trialStartedAt = req.user.trialStartedAt ? new Date(req.user.trialStartedAt) : new Date(req.user.createdAt);
    const trialExpiryDate = new Date(trialStartedAt.getTime() + trialDuration);
    const isTrialActive = new Date() < trialExpiryDate;

    if (isTrialActive) {
      return next();
    }

    return res.status(403).json({
      message: 'Trial expired and no active subscription found. Please upgrade to continue.',
      trialExpired: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

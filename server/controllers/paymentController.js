// server/controllers/paymentController.js

import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';

// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (plan !== '6-months') {
      return res.status(400).json({ message: 'Invalid plan. Only 6-months plan is available.' });
    }

    const amount = 6000; // ₹60 in paise

    const order = await razorpayInstance.orders.create({
      amount,
      currency: 'INR',
    });

    await Payment.create({
      user: req.user._id,
      razorpayOrderId: order.id,
      amount,
      plan,
      paymentType: 'online',
      status: 'created',
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    if (plan !== '6-months') {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        plan: '6-months',
        isActive: true,
        startDate: new Date(),
        endDate,
      },
      { upsert: true }
    );

    res.json({ message: 'Payment successful & 6-month subscription activated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/payment/manual-request
// @access  Private
export const requestManualPayment = async (req, res) => {
  try {
    const { amount, plan, transactionId, adminNotes } = req.body;

    if (plan !== '6-months') {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    await Payment.create({
      user: req.user._id,
      amount: amount * 100, // convert to paise
      plan,
      paymentType: 'manual',
      status: 'pending_verification',
      razorpayOrderId: `manual_${transactionId || Date.now()}`,
      adminNotes: adminNotes || 'Manual transaction request',
    });

    res.status(201).json({ message: 'Payment request submitted for verification' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

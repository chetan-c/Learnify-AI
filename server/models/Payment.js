// server/models/Payment.js

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: {
      type: String,
    },

    amount: {
      type: Number,
      required: true, // in paise
    },

    currency: {
      type: String,
      default: 'INR',
    },

    plan: {
      type: String,
      enum: ['6-months'],
      required: true,
    },

    paymentType: {
      type: String,
      enum: ['online', 'manual'],
      default: 'online',
    },

    status: {
      type: String,
      enum: ['created', 'pending_verification', 'paid', 'failed', 'rejected'],
      default: 'created',
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    verificationDate: {
      type: Date,
    },

    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', paymentSchema);

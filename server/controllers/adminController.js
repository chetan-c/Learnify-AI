// server/controllers/adminController.js

import User from '../models/User.js';
import PDF from '../models/PDF.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';

// @desc    Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payments for verification
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({}).populate('user', 'name email').sort('-createdAt');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify manual payment
export const verifyManualPayment = async (req, res) => {
    try {
        const { paymentId, status, adminNotes } = req.body;

        if (!['paid', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = status;
        payment.verifiedBy = req.user._id;
        payment.verificationDate = new Date();
        payment.adminNotes = adminNotes;
        await payment.save();

        if (status === 'paid') {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 6);

            await Subscription.findOneAndUpdate(
                { user: payment.user },
                {
                    plan: '6-months',
                    isActive: true,
                    startDate: new Date(),
                    endDate,
                },
                { upsert: true }
            );
        }

        res.json({ message: `Payment ${status} and subscription updated` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all PDFs (Admin only)
export const getAllPDFs = async (req, res) => {
    try {
        const pdfs = await PDF.find({}).populate('user', 'name email').select('-extractedText').sort('-createdAt');
        res.json(pdfs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Override user subscription
export const overrideSubscription = async (req, res) => {
    try {
        const { userId, plan, isActive, durationMonths } = req.body;

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (durationMonths || 6));

        const subscription = await Subscription.findOneAndUpdate(
            { user: userId },
            {
                plan: plan || '6-months',
                isActive: isActive !== undefined ? isActive : true,
                startDate: new Date(),
                endDate,
            },
            { upsert: true, new: true }
        );

        res.json({ message: 'Subscription overridden by Admin', subscription });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system-wide metrics
export const getSystemStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const pdfCount = await PDF.countDocuments();
        const activeSubs = await Subscription.countDocuments({ isActive: true });
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            users: userCount,
            pdfs: pdfCount,
            activeSubscriptions: activeSubs,
            revenueInPaise: totalRevenue[0]?.total || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

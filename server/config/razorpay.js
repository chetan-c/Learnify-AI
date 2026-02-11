// server/config/razorpay.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export default razorpayInstance;

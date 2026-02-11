console.log("1. Starting debug");
import 'dotenv/config';
console.log("2. Dotenv loaded");
console.log("RAZORPAY_KEY_ID set:", !!process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_SECRET set:", !!process.env.RAZORPAY_SECRET);

try {
    await import('./config/db.js');
    console.log("3. DB config loaded");
} catch (e) { console.error("Error loading DB", e.message); }

try {
    await import('./config/razorpay.js');
    console.log("4. Razorpay config loaded");
} catch (e) { console.error("Error loading Razorpay", e.message); }

try {
    await import('./config/gemini.js');
    console.log("5. Gemini config loaded");
} catch (e) { console.error("Error loading Gemini", e.message); }

try {
    await import('./app.js');
    console.log("6. App loaded");
} catch (e) { console.error("Error loading App", e.message); }

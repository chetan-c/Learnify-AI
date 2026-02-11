
try {
    const Razorpay = (await import('razorpay')).default;
    console.log("Default export:", typeof Razorpay);
} catch (e) { console.log("Default export failed:", e.message); }

try {
    const pkg = await import('razorpay');
    console.log("Keys:", Object.keys(pkg));
    console.log("Razorpay export:", typeof pkg.Razorpay);
} catch (e) { }

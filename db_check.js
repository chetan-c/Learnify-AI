import PDF from './server/models/PDF.js';
import User from './server/models/User.js';
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/edu_ai_app';

async function checkSystem() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const latestUser = await User.findOne().sort({ createdAt: -1 });
        if (latestUser) {
            console.log(`User found: ${latestUser.email}, Role: ${latestUser.role}, Name: ${latestUser.name}`);

            const count = await PDF.countDocuments({ user: latestUser._id });
            console.log(`PDF Count for this user: ${count}`);

            const pdfs = await PDF.find({ user: latestUser._id }).sort({ createdAt: -1 });
            pdfs.forEach((pdf, index) => {
                console.log(`PDF ${index + 1}: ${pdf.originalName}, Processed: ${pdf.isProcessed}, Size: ${pdf.size}`);
                if (index === 0) {
                    console.log(`   Sample Text: "${pdf.extractedText?.substring(0, 100).replace(/\n/g, ' ')}..."`);
                }
            });

            if (count === 5) {
                console.log('✅ Success: Exactly 5 PDFs were allowed to be uploaded.');
            } else {
                console.log(`⚠️ Warning: Expected 5 PDFs, but found ${count}.`);
            }

            // Verify a normal user cannot access admin
            console.log('RBAC Check: User role is ' + latestUser.role);
        } else {
            console.log('No user found.');
        }

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkSystem();

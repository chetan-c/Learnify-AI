import fs from 'fs';

const PORT = 5000;
const API_URL = `http://localhost:${PORT}/api`;

async function deepAudit() {
    console.log('--- STARTING DEEP LOGIC AUDIT ---');

    try {
        // 1. Setup: Register a user
        const userPayload = {
            name: 'Audit User',
            email: `audit_${Date.now()}@example.com`,
            password: 'password123'
        };
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        const { token } = await regRes.json();

        // 2. Test: Scanned/Empty PDF Detection
        console.log('\n[1/3] Testing Scanned/Empty PDF Handling...');
        // Create an empty PDF (no text context)
        const emptyPdfPath = './empty.pdf';
        const emptyPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
        fs.writeFileSync(emptyPdfPath, emptyPdfContent);

        const formData = new FormData();
        const blob = new Blob([emptyPdfContent], { type: 'application/pdf' });
        formData.append('pdf', blob, 'empty.pdf');

        const uploadRes = await fetch(`${API_URL}/pdf/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const uploadData = await uploadRes.json();

        if (uploadRes.status === 500 && uploadData.message.includes('possible scanned document')) {
            console.log('✅ Success: Scanned/Empty PDF correctly detected and reported.');
        } else {
            console.error('❌ Failure: Scanned PDF was NOT correctly rejected/flagged.');
            console.log('Status:', uploadRes.status, 'Message:', uploadData.message);
        }

        // 3. Test: AI context Grounding (Out-of-context question)
        console.log('\n[2/3] Testing AI context Grounding...');
        // First upload a valid PDF with specific content
        const validPdfContent = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 51 >>\nstream\nBT /F1 12 Tf 72 712 Td (The capital of France is Paris.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000015 00000 n \n0000000062 00000 n \n0000000122 00000 n \n0000000231 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n333\n%%EOF');
        const validFormData = new FormData();
        validFormData.append('pdf', new Blob([validPdfContent], { type: 'application/pdf' }), 'valid.pdf');

        const validUploadRes = await fetch(`${API_URL}/pdf/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: validFormData
        });
        const validPdfData = await validUploadRes.json();
        const pdfId = validPdfData._id;

        // Ask a question NOT in the PDF
        console.log('   Asking out-of-context question: "What is the capital of Japan?"');
        const askRes = await fetch(`${API_URL}/ai/ask`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pdfId, question: 'What is the capital of Japan?' })
        });
        const askData = await askRes.json();
        console.log('   AI Response:', askData.answer);

        if (askData.answer.toLowerCase().includes('not available') || askData.answer.toLowerCase().includes('sorry')) {
            console.log('✅ Success: AI correctly refused to answer external knowledge question.');
        } else {
            console.error('❌ Failure: AI answered using external knowledge.');
        }

        // 4. Test: Admin Data visibility
        console.log('\n[3/3] Testing Admin feature availability...');
        // We know from previous log that /admin/users gave 403 for this user.
        // Let's verify stats visibility.
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.status === 403) {
            console.log('✅ RBAC Verified: Normal user cannot view system stats.');
        } else {
            console.error('❌ Security Breach: Normal user accessed system stats.');
        }

        console.log('\n--- DEEP AUDIT COMPLETED ---');
        if (fs.existsSync(emptyPdfPath)) fs.unlinkSync(emptyPdfPath);

    } catch (error) {
        console.error('Audit failed:', error.message);
    }
}

deepAudit();

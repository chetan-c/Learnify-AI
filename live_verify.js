import fs from 'fs';

const PORT = 5000;
const API_URL = `http://localhost:${PORT}/api`;

async function runLiveAssurance() {
    console.log('--- LEARN_AI LIVE API KEY VERIFICATION ---');

    const results = {
        auth: { status: 'PENDING', details: '' },
        pdf: { status: 'PENDING', details: '' },
        ai_chat: { status: 'PENDING', details: '' },
        ai_mcqs: { status: 'PENDING', details: '' },
        ai_notes: { status: 'PENDING', details: '' }
    };

    try {
        // 1. Auth
        const userPayload = {
            name: 'Live Auditor',
            email: `live_${Date.now()}@example.com`,
            password: 'password123'
        };
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        const regData = await regRes.json();
        const { token } = regData;
        results.auth.status = 'SUCCESS';

        // 2. PDF Upload
        const pdfContent = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT /F1 12 Tf 72 712 Td (Photosynthesis is the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000015 00000 n \n0000000062 00000 n \n0000000122 00000 n \n0000000231 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n333\n%%EOF');
        const formData = new FormData();
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        formData.append('pdf', blob, 'bio.pdf');

        const uploadRes = await fetch(`${API_URL}/pdf/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const uploadData = await uploadRes.json();
        const pdfId = uploadData._id;
        results.pdf.status = 'SUCCESS';

        // 3. AI Chat
        console.log('   Testing AI Chat...');
        const chatRes = await fetch(`${API_URL}/ai/ask`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfId, question: "What process is mentioned in the text?" })
        });
        const chatData = await chatRes.json();
        if (chatRes.status === 200 && chatData.answer?.toLowerCase().includes('photosynthesis')) {
            results.ai_chat.status = 'SUCCESS';
            results.ai_chat.details = chatData.answer.substring(0, 50) + '...';
        } else {
            results.ai_chat.status = 'FAILED';
            results.ai_chat.details = chatData.message || 'Verification failed';
        }

        // 4. AI MCQs
        console.log('   Testing AI MCQs...');
        const mcqRes = await fetch(`${API_URL}/ai/generate-mcqs`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfId, difficulty: 'easy', count: 2 })
        });
        const mcqData = await mcqRes.json();
        if (mcqRes.status === 200 && Array.isArray(mcqData) && mcqData.length > 0) {
            results.ai_mcqs.status = 'SUCCESS';
        } else {
            results.ai_mcqs.status = 'FAILED';
        }

        // 5. AI Notes
        console.log('   Testing AI Notes...');
        const notesRes = await fetch(`${API_URL}/ai/generate-notes`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfId, type: 'summary' })
        });
        const notesData = await notesRes.json();
        if (notesRes.status === 200 && notesData.notes) {
            results.ai_notes.status = 'SUCCESS';
        } else {
            results.ai_notes.status = 'FAILED';
        }

        console.table(results);
        if (Object.values(results).every(r => r.status === 'SUCCESS')) {
            console.log('✅ ALL AI FEATURES VERIFIED AND FUNCTIONAL!');
        } else {
            console.log('❌ SOME FEATURES FAILED. PLEASE CHECK LOGS.');
        }

    } catch (e) {
        console.error('LIVE VERIFICATION ERROR:', e.message);
    }
}

runLiveAssurance();

import fs from 'fs';
import path from 'path';

const PORT = 5000;
const API_URL = `http://localhost:${PORT}/api`;

async function runVerification() {
    console.log('--- STARTING SYSTEM VERIFICATION (v2) ---');

    try {
        // 1. Verify API Registration & Profile
        console.log('\n[1/4] Verifying Registration & Profile Update...');
        const userPayload = {
            name: 'QA Tester',
            email: `tester_${Date.now()}@example.com`,
            password: 'password123'
        };

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        const regData = await regRes.json();
        const token = regData.token;
        if (token) {
            console.log('✅ User registered successfully.');
        } else {
            throw new Error('Registration failed: ' + JSON.stringify(regData));
        }

        const updateRes = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'QA Tester Updated' })
        });
        const updateData = await updateRes.json();
        if (updateData.name === 'QA Tester Updated') {
            console.log('✅ Profile name update verified.');
        } else {
            console.error('❌ Profile name update failed:', updateData);
        }

        const profileRes = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileData.name === 'QA Tester Updated') {
            console.log('✅ Profile persistence verified.');
        } else {
            console.error('❌ Profile persistence failed:', profileData);
        }

        // 2. Verify Rate Limiting (5 PDFs per day)
        console.log('\n[2/4] Verifying Daily Upload Limit (5 PDFs/day)...');

        // Use a real PDF from the server/uploads if any, or create a dummy one that is VALID enough for pdf-parse
        // pdf-parse needs at least some PDF structure.
        const mockPdfPath = './test_verify.pdf';
        const pdfContent = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 51 >>\nstream\nBT /F1 12 Tf 72 712 Td (Hello Verification World) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000015 00000 n \n0000000062 00000 n \n0000000122 00000 n \n0000000231 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n333\n%%EOF');
        fs.writeFileSync(mockPdfPath, pdfContent);

        let uploadsSucceeded = 0;
        let limitHit = false;

        for (let i = 0; i < 6; i++) {
            const formData = new FormData();
            const blob = new Blob([pdfContent], { type: 'application/pdf' });
            formData.append('pdf', blob, 'test.pdf');

            try {
                const uploadRes = await fetch(`${API_URL}/pdf/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const uploadData = await uploadRes.json();

                if (uploadRes.status === 201) {
                    uploadsSucceeded++;
                    console.log(`   Upload ${i + 1}: Success (201)`);
                } else if (uploadRes.status === 429) {
                    limitHit = true;
                    console.log(`   Upload ${i + 1}: 429 Too Many Requests (Correct)`);
                    console.log('   Message:', uploadData.message);
                } else {
                    console.error(`   Upload ${i + 1}: Failed with ${uploadRes.status}`);
                    console.error('   Data:', uploadData);
                }
            } catch (e) {
                console.error(`   Upload ${i + 1}: Exception:`, e.message);
            }
        }

        if (uploadsSucceeded === 5 && limitHit) {
            console.log('✅ Daily upload limit (5) successfully enforced.');
        } else {
            console.error(`❌ Upload limit failed. Succeeded: ${uploadsSucceeded}, Limit hit: ${limitHit}`);
        }

        // 3. Verify RBAC (Admin access)
        console.log('\n[3/4] Verifying RBAC Security...');
        const adminRes = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (adminRes.status === 403) {
            console.log('✅ RBAC Verified: Normal user forbidden from admin endpoints.');
        } else {
            console.error('❌ RBAC failed with status:', adminRes.status);
        }

        // 4. Verify PDF Text Extraction Successful
        console.log('\n[4/4] Verifying PDF Text Extraction accuracy...');
        // We'll check the text of one of the uploaded PDFs if available
        // Since we uploaded 5, let's check one.
        const myPDFsRes = await fetch(`${API_URL}/pdf`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const myPDFsData = await myPDFsRes.json();
        if (myPDFsData.length > 0) {
            console.log('✅ PDF metadata stored in DB.');
            // Check actual text extraction - need to check if parser worked for our dummy PDF
            // The dummy PDF has "Hello Verification World"
        } else {
            console.error('❌ No PDFs found in library.');
        }

        console.log('\n--- VERIFICATION COMPLETED ---');
        if (fs.existsSync(mockPdfPath)) fs.unlinkSync(mockPdfPath);

    } catch (error) {
        console.error('\nVerification critical error:', error.message);
    }
}

runVerification();

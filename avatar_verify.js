import fs from 'fs';

const PORT = 5000;
const API_URL = `http://localhost:${PORT}/api`;

async function verifyAvatar() {
    console.log('--- VERIFYING AVATAR UPLOAD ---');

    try {
        const userPayload = {
            name: 'QA Avatar Tester',
            email: `avatar_${Date.now()}@example.com`,
            password: 'password123'
        };

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        const regData = await regRes.json();
        const token = regData.token;

        const formData = new FormData();
        const dummyImg = Buffer.from('dummy image data');
        const blob = new Blob([dummyImg], { type: 'image/png' });
        formData.append('avatar', blob, 'avatar.png');

        const avatarRes = await fetch(`${API_URL}/users/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const avatarData = await avatarRes.json();

        if (avatarRes.status === 200 && avatarData.avatar.startsWith('/uploads/avatar-')) {
            console.log('✅ Avatar upload successful:', avatarData.avatar);

            // Verify access to the static file
            const fileRes = await fetch(`http://localhost:${PORT}${avatarData.avatar}`);
            if (fileRes.status === 200) {
                console.log('✅ Avatar serving verified via static folder.');
            } else {
                console.error('❌ Avatar serving failed:', fileRes.status);
            }
        } else {
            console.error('❌ Avatar upload failed:', avatarRes.status, avatarData);
        }

    } catch (error) {
        console.error('Avatar verification failed:', error.message);
    }
}

verifyAvatar();

import fs from 'fs';
import path from 'path';

const baseURL = 'http://localhost:5000/api';

const postJson = async (url, body, token) => {
  const res = await fetch(baseURL + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
};

async function main() {
  const ts = Date.now();
  const email = `ai-test-${ts}@example.com`;
  const password = 'Test1234!';

  console.log('--- Register user ---');
  const reg = await postJson('/auth/register', { name: 'AI Tester', email, password });
  console.log('status', reg.status, 'body', reg.json);
  if (reg.status !== 201) return;
  const token = reg.json.token;

  console.log('\n--- Upload PDF ---');
  const pdfPath = path.join(process.cwd(), 'uploads', '1769939711529-valid.pdf');
  const fileBuf = fs.readFileSync(pdfPath);
  const blob = new Blob([fileBuf], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('pdf', blob, 'valid.pdf');

  const uploadRes = await fetch(baseURL + '/pdf/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadText = await uploadRes.text();
  let uploadJson;
  try {
    uploadJson = JSON.parse(uploadText);
  } catch {
    uploadJson = { raw: uploadText };
  }
  console.log('status', uploadRes.status, 'body', uploadJson);
  if (uploadRes.status !== 201) return;
  const pdfId = uploadJson._id;

  console.log('\n--- AI Ask ---');
  const ask = await postJson('/ai/ask', { pdfId, question: 'What is this document about?' }, token);
  console.log('status', ask.status, 'body', ask.json);

  console.log('\n--- Generate MCQs ---');
  const mcqs = await postJson('/ai/generate-mcqs', { pdfId, difficulty: 'medium', count: 5 }, token);
  console.log('status', mcqs.status, 'body', mcqs.json);

  console.log('\n--- Generate Exam ---');
  const exam = await postJson('/ai/generate-exam', { pdfId, difficulty: 'medium', count: 5, duration: 15 }, token);
  console.log('status', exam.status, 'body', exam.json);

  console.log('\n--- Generate Notes ---');
  const notes = await postJson('/ai/generate-notes', { pdfId, type: 'summary' }, token);
  console.log('status', notes.status, 'body', notes.json);

  console.log('\n--- Delete PDF ---');
  const delRes = await fetch(baseURL + `/pdf/${pdfId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const delText = await delRes.text();
  let delJson;
  try {
    delJson = JSON.parse(delText);
  } catch {
    delJson = { raw: delText };
  }
  console.log('status', delRes.status, 'body', delJson);

  console.log('\n--- Avatar Upload & Profile ---');
  const logoPath = path.join(process.cwd(), '..', 'client', 'public', 'logo.png');
  const imgBuf = fs.readFileSync(logoPath);
  const imgBlob = new Blob([imgBuf], { type: 'image/png' });
  const avatarForm = new FormData();
  avatarForm.append('avatar', imgBlob, 'logo.png');

  const avatarRes = await fetch(baseURL + '/users/avatar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: avatarForm,
  });
  const avatarText = await avatarRes.text();
  let avatarJson;
  try {
    avatarJson = JSON.parse(avatarText);
  } catch {
    avatarJson = { raw: avatarText };
  }
  console.log('avatar upload status', avatarRes.status, 'body', avatarJson);

  const profileRes = await fetch(baseURL + '/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profileText = await profileRes.text();
  let profileJson;
  try {
    profileJson = JSON.parse(profileText);
  } catch {
    profileJson = { raw: profileText };
  }
  console.log('profile status', profileRes.status, 'body', profileJson);
}

main().catch((err) => {
  console.error('TEST SCRIPT ERROR', err);
});


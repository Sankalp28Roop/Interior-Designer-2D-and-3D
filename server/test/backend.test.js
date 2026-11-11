import assert from 'node:assert';
import test from 'node:test';
import app from '../src/server.js';
import { db } from '../src/config/database.js';

let server;
const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api`;

test.before(async () => {
  await new Promise(resolve => {
    server = app.listen(PORT, resolve);
  });
});

test.after(async () => {
  await new Promise(resolve => {
    server.close(resolve);
  });
});

test('1. Healthcheck Endpoint returns healthy status', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'healthy');
  assert.strictEqual(data.platform, 'AtelierAI 3D Spatial Engine');
});

test('2. User Auth flow: Signup, Login, and verify JWT', async () => {
  const testEmail = `designer_${Date.now()}@atelierai.design`;
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'ArchitectPassword2026',
      name: 'Elena Rostova'
    })
  });
  assert.strictEqual(signupRes.status, 201);
  const signupData = await signupRes.json();
  assert.strictEqual(signupData.success, true);
  assert.ok(signupData.token);

  // Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'ArchitectPassword2026'
    })
  });
  assert.strictEqual(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.user.name, 'Elena Rostova');
});

test('3. Multilingual Prompt Enhancer: Hindi/Hinglish detection & Architectural Enrichment', async () => {
  // Hindi input test
  const hindiPrompt = 'कमरे में चारकोल ब्रिक दीवार और आधुनिक सोफा चाहिए';
  const res = await fetch(`${BASE_URL}/prompt/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: hindiPrompt })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.detectedLanguage, 'hi');
  assert.ok(data.enhancedPrompt.length > 20);
  assert.ok(['GENERATE_2D_SCENE', 'GENERATE_3D_DOLLHOUSE', 'INPAINT_EDIT'].includes(data.intent));
});

test('4. Inpaint Intent Detection: "Keep layout, change walls to charcoal brick"', async () => {
  const inpaintPrompt = 'Keep layout, change walls to charcoal brick';
  const res = await fetch(`${BASE_URL}/prompt/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: inpaintPrompt })
  });
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.intent, 'INPAINT_EDIT');
});

test('5. 2D Generation Route (/api/generate/2d)', async () => {
  const res = await fetch(`${BASE_URL}/generate/2d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Japandi living room with fluted oak and bouclé armchair',
      style: 'Japandi & Warm Minimalism',
      lighting: 'Morning Golden Hour',
      camera: 'Isometric Cutaway Dollhouse'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.imageUrl);
});

test('6. Inpainting Route (/api/generate/inpaint)', async () => {
  const res = await fetch(`${BASE_URL}/generate/inpaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Change accent wall to dark charcoal fluted brick',
      initImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.updatedImageUrl);
});

test('7. 3D Mesh Generation Route (/api/generate/3d)', async () => {
  const res = await fetch(`${BASE_URL}/generate/3d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Scandinavian Oak Coffee Table with brass feet',
      mode: 'text-to-3d'
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.status, 'SUCCEEDED');
  assert.ok(data.modelUrl.includes('.glb'));
  assert.ok(data.pbrTextures.diffuse);
});

test('8. Client Spec Sheet PDF Export Route (/api/export/spec-pdf)', async () => {
  // Create a project first
  const createProjRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'St. Moritz Penthouse Atelier',
      style_preset: 'Japandi & Warm Minimalism',
      diurnal_lighting: 'Moody Twilight',
      camera_angle: 'Isometric Cutaway Dollhouse',
      render_2d_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
      model_3d_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
      color_swatches: ['#F3EFE6', '#D4AF37', '#184234', '#24272C'],
      materials_list: [
        'Beige Bouclé Fabric',
        'Brushed Architectural Brass',
        'Emerald Velvet Accent Cushion',
        'Textured Charcoal Fluted Timber'
      ]
    })
  });
  const projData = await createProjRes.json();
  const projectId = projData.projectId;
  assert.ok(projectId);

  // Request PDF Export
  const pdfRes = await fetch(`${BASE_URL}/export/spec-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId })
  });
  assert.strictEqual(pdfRes.status, 200);
  assert.strictEqual(pdfRes.headers.get('content-type'), 'application/pdf');
  const buffer = await pdfRes.arrayBuffer();
  assert.ok(buffer.byteLength > 1000); // Verify PDF bytes generated
});

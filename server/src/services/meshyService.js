/**
 * Meshy AI Service
 * Supports Text-to-3D and Image-to-3D with async task polling until SUCCEEDED.
 * Integrates with https://api.meshy.ai
 */

const MESHY_BASE_URL = 'https://api.meshy.ai/openapi/v2';

export async function createTextTo3DTask({ prompt, artStyle = 'realistic', apiKey }) {
  const response = await fetch(`${MESHY_BASE_URL}/text-to-3d`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mode: 'preview',
      prompt: `${prompt}, clean interior architectural geometry, high quality PBR materials`,
      art_style: artStyle,
      should_remesh: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meshy Text-to-3D submission failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.result; // Returns task ID string
}

export async function createImageTo3DTask({ imageUrl, enablePBR = true, apiKey }) {
  const response = await fetch(`${MESHY_BASE_URL}/image-to-3d`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: imageUrl,
      enable_pbr: enablePBR,
      should_remesh: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meshy Image-to-3D submission failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.result; // Returns task ID string
}

export async function checkMeshyTaskStatus(taskId, mode = 'text-to-3d', apiKey) {
  const endpoint = mode === 'image-to-3d' 
    ? `${MESHY_BASE_URL}/image-to-3d/${taskId}`
    : `${MESHY_BASE_URL}/text-to-3d/${taskId}`;

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to query Meshy task ${taskId}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Async Task Polling Mechanism
 * Polls every intervalMs until SUCCEEDED or FAILED or timeout.
 */
export async function pollMeshyTaskUntilDone({
  taskId,
  mode = 'text-to-3d',
  apiKey,
  maxWaitMs = 120000, // 2 minutes max
  intervalMs = 4000,
  onProgress = null
}) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const taskData = await checkMeshyTaskStatus(taskId, mode, apiKey);
    const status = taskData.status; // 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED'
    const progress = taskData.progress || 0;

    if (onProgress && typeof onProgress === 'function') {
      onProgress({ status, progress, taskData });
    }

    if (status === 'SUCCEEDED') {
      return {
        status: 'SUCCEEDED',
        progress: 100,
        modelUrl: taskData.model_urls?.glb || taskData.model_urls?.obj,
        textureUrls: taskData.texture_urls || [],
        thumbnailUrl: taskData.thumbnail_url,
        taskData
      };
    }

    if (status === 'FAILED' || status === 'EXPIRED') {
      throw new Error(`Meshy task ${taskId} ended with status: ${status}. Error: ${taskData.task_error?.message || 'Unknown'}`);
    }

    // Wait for next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Meshy task ${taskId} timed out after ${maxWaitMs / 1000} seconds.`);
}

/**
 * High-fidelity Simulated Meshy 3D Result
 * Used for development, local sandbox testing, or when API key is not yet set.
 */
export function getSimulated3DResult(type, prompt) {
  return {
    status: 'SUCCEEDED',
    progress: 100,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
    pbrTextures: {
      diffuse: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
      normal: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      roughness: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80'
    },
    meta: {
      engine: 'Meshy AI v2 (Simulated Architectural 3D Asset)',
      type,
      prompt: prompt || 'Architectural Accent Chair & Spatial Mesh',
      format: 'GLB (glTF 2.0 Binary) + PBR Textures'
    }
  };
}

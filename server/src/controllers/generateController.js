import {
  generateModelsLab2D,
  generateModelsLabInpaint,
  STYLE_PRESETS,
  LIGHTING_MODIFIERS,
  CAMERA_MODIFIERS
} from '../services/modelsLabService.js';
import {
  createTextTo3DTask,
  createImageTo3DTask,
  pollMeshyTaskUntilDone,
  getSimulated3DResult
} from '../services/meshyService.js';
import { db } from '../config/database.js';
import { generateId, safeJsonStringify, safeJsonParse } from '../utils/helpers.js';

/**
 * 2D Photorealistic & Isometric Floorplan Generation Route
 * POST /api/generate/2d
 */
export async function generate2DHandler(req, res) {
  try {
    const {
      prompt,
      style = 'Japandi & Warm Minimalism',
      lighting = 'Morning Golden Hour',
      camera = 'Isometric Cutaway Dollhouse',
      roomType = 'living room',
      initImage = null,
      projectId = null,
      width = 1024,
      height = 768
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid prompt for 2D room generation.'
      });
    }

    const userId = req.user?.id || 'guest_user';
    const jobId = generateId('job_2d');

    // Create job record
    db.prepare(`
      INSERT INTO generation_jobs (id, user_id, project_id, service, job_type, status, input_params)
      VALUES (?, ?, ?, 'modelslab', '2d_interior', 'IN_PROGRESS', ?)
    `).run(jobId, userId, projectId, safeJsonStringify({ prompt, style, lighting, camera, roomType }));

    try {
      const result = await generateModelsLab2D({
        prompt: prompt.trim(),
        style,
        lighting,
        camera,
        roomType,
        initImage,
        width,
        height
      });

      const imageUrl = result.output?.[0] || (Array.isArray(result.future_links) ? result.future_links[0] : null);

      // Update job to SUCCEEDED
      db.prepare(`
        UPDATE generation_jobs
        SET status = 'SUCCEEDED', progress = 100, output_result = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(safeJsonStringify(result), jobId);

      // If projectId was provided, update the project's render_2d_url
      if (projectId && imageUrl) {
        db.prepare(`
          UPDATE projects
          SET render_2d_url = ?, current_prompt = ?, style_preset = ?, diurnal_lighting = ?, camera_angle = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(imageUrl, prompt.trim(), style, lighting, camera, projectId);
      }

      return res.json({
        success: true,
        jobId,
        imageUrl,
        style,
        lighting,
        camera,
        result
      });
    } catch (err) {
      db.prepare(`
        UPDATE generation_jobs
        SET status = 'FAILED', error_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(err.message, jobId);

      throw err;
    }
  } catch (err) {
    console.error('2D Generation handler error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate 2D interior render.'
    });
  }
}

/**
 * Multi-Turn Inpainting Route
 * POST /api/generate/inpaint
 */
export async function generateInpaintHandler(req, res) {
  try {
    const {
      prompt,
      initImage,
      maskImage,
      projectId = null
    } = req.body;

    if (!prompt || !initImage) {
      return res.status(400).json({
        success: false,
        error: 'Both prompt and initImage are required for inpainting.'
      });
    }

    const userId = req.user?.id || 'guest_user';
    const jobId = generateId('job_inp');

    db.prepare(`
      INSERT INTO generation_jobs (id, user_id, project_id, service, job_type, status, input_params)
      VALUES (?, ?, ?, 'modelslab', 'inpaint', 'IN_PROGRESS', ?)
    `).run(jobId, userId, projectId, safeJsonStringify({ prompt, initImage: initImage.slice(0, 100) + '...' }));

    try {
      const result = await generateModelsLabInpaint({
        initImage,
        maskImage,
        prompt: prompt.trim()
      });

      const updatedImageUrl = result.output?.[0] || initImage;

      db.prepare(`
        UPDATE generation_jobs
        SET status = 'SUCCEEDED', progress = 100, output_result = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(safeJsonStringify(result), jobId);

      if (projectId && updatedImageUrl) {
        db.prepare(`
          UPDATE projects
          SET render_2d_url = ?, current_prompt = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(updatedImageUrl, prompt.trim(), projectId);
      }

      return res.json({
        success: true,
        jobId,
        updatedImageUrl,
        result
      });
    } catch (err) {
      db.prepare(`
        UPDATE generation_jobs
        SET status = 'FAILED', error_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(err.message, jobId);

      throw err;
    }
  } catch (err) {
    console.error('Inpaint handler error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process inpainting request.'
    });
  }
}

/**
 * True 3D Mesh & Asset Extraction Route
 * POST /api/generate/3d
 * Supports both Text-to-3D and Image-to-3D with async polling until SUCCEEDED.
 */
export async function generate3DHandler(req, res) {
  try {
    const {
      prompt,
      imageUrl,
      mode = imageUrl ? 'image-to-3d' : 'text-to-3d',
      artStyle = 'realistic',
      enablePBR = true,
      projectId = null,
      asyncPoll = true // If true, backend polls Meshy until SUCCEEDED before returning
    } = req.body;

    if (mode === 'image-to-3d' && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl is required when generating 3D from image.'
      });
    }

    if (mode === 'text-to-3d' && !prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required when generating 3D from text.'
      });
    }

    const userId = req.user?.id || 'guest_user';
    const jobId = generateId('job_3d');
    const apiKey = process.env.MESHY_API_KEY;

    db.prepare(`
      INSERT INTO generation_jobs (id, user_id, project_id, service, job_type, status, input_params)
      VALUES (?, ?, ?, 'meshy', ?, 'IN_PROGRESS', ?)
    `).run(jobId, userId, projectId, mode, safeJsonStringify({ prompt, imageUrl, mode, artStyle }));

    // If key is mock or missing, return simulated 3D model immediately
    if (!apiKey || apiKey === 'mock_key_or_set_your_own' || apiKey.startsWith('mock')) {
      const simulated = getSimulated3DResult(mode, prompt);

      db.prepare(`
        UPDATE generation_jobs
        SET status = 'SUCCEEDED', progress = 100, output_result = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(safeJsonStringify(simulated), jobId);

      if (projectId) {
        db.prepare(`
          UPDATE projects
          SET model_3d_url = ?, pbr_textures = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(simulated.modelUrl, safeJsonStringify(simulated.pbrTextures), projectId);
      }

      return res.json({
        success: true,
        jobId,
        status: 'SUCCEEDED',
        modelUrl: simulated.modelUrl,
        pbrTextures: simulated.pbrTextures,
        meta: simulated.meta
      });
    }

    // Live Meshy API integration
    let externalTaskId;
    if (mode === 'image-to-3d') {
      externalTaskId = await createImageTo3DTask({ imageUrl, enablePBR, apiKey });
    } else {
      externalTaskId = await createTextTo3DTask({ prompt, artStyle, apiKey });
    }

    db.prepare(`
      UPDATE generation_jobs
      SET external_task_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(externalTaskId, jobId);

    if (!asyncPoll) {
      // Return immediately with task tracking ID for client polling
      return res.json({
        success: true,
        jobId,
        taskId: externalTaskId,
        status: 'IN_PROGRESS',
        message: '3D generation task queued successfully.'
      });
    }

    // Backend polling until SUCCEEDED
    const finalResult = await pollMeshyTaskUntilDone({
      taskId: externalTaskId,
      mode,
      apiKey,
      intervalMs: 4000,
      maxWaitMs: 180000,
      onProgress: ({ progress }) => {
        db.prepare(`
          UPDATE generation_jobs SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(progress, jobId);
      }
    });

    db.prepare(`
      UPDATE generation_jobs
      SET status = 'SUCCEEDED', progress = 100, output_result = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(safeJsonStringify(finalResult), jobId);

    if (projectId && finalResult.modelUrl) {
      db.prepare(`
        UPDATE projects
        SET model_3d_url = ?, pbr_textures = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(finalResult.modelUrl, safeJsonStringify(finalResult.textureUrls), projectId);
    }

    return res.json({
      success: true,
      jobId,
      status: 'SUCCEEDED',
      modelUrl: finalResult.modelUrl,
      textureUrls: finalResult.textureUrls,
      thumbnailUrl: finalResult.thumbnailUrl
    });
  } catch (err) {
    console.error('3D Generation handler error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate 3D model.'
    });
  }
}

/**
 * Check Job Status Route
 * GET /api/generate/status/:jobId
 */
export function getJobStatusHandler(req, res) {
  try {
    const { jobId } = req.params;
    const job = db.prepare('SELECT * FROM generation_jobs WHERE id = ?').get(jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found.' });
    }

    return res.json({
      success: true,
      job: {
        ...job,
        input_params: safeJsonParse(job.input_params, {}),
        output_result: safeJsonParse(job.output_result, {})
      }
    });
  } catch (err) {
    console.error('Job status check error:', err);
    return res.status(500).json({ success: false, error: 'Failed to check job status.' });
  }
}

/**
 * Get Available Generation Presets & Options
 * GET /api/generate/presets
 */
export function getGenerationPresets(req, res) {
  return res.json({
    success: true,
    presets: {
      styles: Object.keys(STYLE_PRESETS),
      lighting: Object.keys(LIGHTING_MODIFIERS),
      cameras: Object.keys(CAMERA_MODIFIERS)
    }
  });
}

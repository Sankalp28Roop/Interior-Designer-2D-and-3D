/**
 * ModelsLab API Service for Interior Design & Inpainting
 * Integrates with https://modelslab.com API endpoints.
 */

const MODELSLAB_BASE_URL = 'https://modelslab.com/api/v6/interior';
const MODELSLAB_INPAINT_URL = 'https://modelslab.com/api/v6/realtime/inpaint';

export const LIGHTING_MODIFIERS = {
  'Morning Golden Hour': 'bathed in warm 3000K morning sunlight, long soft shadows, golden hour glow through crittall glazing',
  'Midday': 'diffused 5500K neutral daylight, balanced ambient fill, clear architectural illumination, minimal glare',
  'Moody Twilight': 'moody 2700K twilight dusk ambience, recessed warm architectural LED linear coves, sculptural pendant accent lighting'
};

export const CAMERA_MODIFIERS = {
  'Wide-angle Perspective': '24mm architectural wide-angle lens, rectilinear perspective, two-point perspective, perfectly vertical walls',
  'Isometric Cutaway Dollhouse': 'orthographic isometric cutaway dollhouse view, 45 degree angle, exposed architectural section cut, diorama miniature aesthetic',
  'Top-down Floorplan': 'direct overhead 90-degree axonometric floorplan view, architectural zoning layout, plan drawing perspective'
};

export const STYLE_PRESETS = {
  'Japandi & Warm Minimalism': 'Japandi interior style, wabi-sabi simplicity, fluted white oak cabinetry, off-white limewash walls, textured beige bouclé seating, bonsai tree accent',
  'Modern Bauhaus': 'Bauhaus design language, tubular brushed chrome, primary geometry, rich cognac saddle leather, polished concrete floors',
  'Industrial Loft': 'tactile exposed red and charcoal brickwork, double-height ceilings, structural blackened steel beams, expansive factory sash windows, aged chevron timber',
  'Scandinavian Modern': 'Nordic interior, pale ash wood, soft wool rugs, understated organic curves, clean functional spatial organization'
};

/**
 * Generate 2D Interior Render or Isometric Floorplan
 */
export async function generateModelsLab2D({
  prompt,
  style = 'Japandi & Warm Minimalism',
  lighting = 'Morning Golden Hour',
  camera = 'Isometric Cutaway Dollhouse',
  roomType = 'living room',
  initImage = null,
  width = 1024,
  height = 768,
  apiKey = process.env.MODELSLAB_API_KEY
}) {
  const lightingSnippet = LIGHTING_MODIFIERS[lighting] || lighting;
  const cameraSnippet = CAMERA_MODIFIERS[camera] || camera;
  const styleSnippet = STYLE_PRESETS[style] || style;

  const fullPrompt = `${prompt}, ${styleSnippet}, ${roomType}, ${cameraSnippet}, ${lightingSnippet}, high-end architectural digest photography, octane render, 8k resolution, photorealistic masterwork`;

  const negativePrompt = 'blurry, low quality, distorted architecture, floating furniture, warped perspective, bad geometry, oversaturated, amateur photo, cartoon, watermark';

  if (!apiKey || apiKey === 'mock_key_or_set_your_own' || apiKey.startsWith('mock')) {
    // Dynamic architectural catalog tailored specifically to the prompt analysis
    const l = (prompt || '').toLowerCase();
    let selectedImage = '/modern_1bhk_dollhouse.jpg';
    let detectedTheme = 'Modern 1BHK Apartment';

    if (l.includes('mountain') || l.includes('snow') || l.includes('village') || l.includes('cabin') || l.includes('fireplace') || l.includes('well')) {
      selectedImage = '/mountain_village_snow_cutaway.jpg';
      detectedTheme = 'Mountain Village Snow Cottage';
    } else if (l.includes('garden') || l.includes('lawn') || l.includes('patio') || l.includes('pool') || l.includes('outdoor')) {
      selectedImage = '/outdoor_lawn_patio.jpg';
      detectedTheme = 'Outdoor Garden & Lawn Lounge';
    } else if (l.includes('kitchen focus') || l.includes('luxury kitchen') || l.includes('chef kitchen') || (l.includes('kitchen') && !l.includes('1bhk') && !l.includes('apartment') && !l.includes('bedroom'))) {
      selectedImage = '/gourmet_chef_kitchen.jpg';
      detectedTheme = 'Gourmet Chef Kitchen Island';
    } else if (l.includes('duplex') || l.includes('two-story') || l.includes('2-story') || l.includes('staircase')) {
      selectedImage = '/realistic_duplex_dollhouse.jpg';
      detectedTheme = 'Two-Story Duplex Loft';
    }

    return {
      status: 'success',
      output: [selectedImage],
      meta: {
        engine: 'AtelierAI Dynamic Architectural Engine',
        detectedTheme,
        prompt: fullPrompt,
        dimensions: { width, height },
        lighting,
        camera
      }
    };
  }

  try {
    const endpoint = initImage ? `${MODELSLAB_BASE_URL}/render` : `${MODELSLAB_BASE_URL}/text2img`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        prompt: fullPrompt,
        negative_prompt: negativePrompt,
        init_image: initImage,
        width: width.toString(),
        height: height.toString(),
        samples: '1',
        num_inference_steps: '30',
        safety_checker: 'no',
        guidance_scale: 7.5
      })
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('ModelsLab 2D API call failed:', err.message);
    throw err;
  }
}

/**
 * Multi-Turn Inpainting for Iterative Room Modifications
 */
export async function generateModelsLabInpaint({
  initImage,
  maskImage,
  prompt,
  negativePrompt = 'blurry, low quality, seams, edge artifacts, cartoon',
  apiKey = process.env.MODELSLAB_API_KEY
}) {
  if (!initImage) {
    throw new Error('initImage URL or base64 is required for inpainting.');
  }

  const enrichedPrompt = `${prompt}, photorealistic material match, seamless architectural inpainting, coherent lighting, realistic perspective and shadows`;

  if (!apiKey || apiKey === 'mock_key_or_set_your_own' || apiKey.startsWith('mock')) {
    return {
      status: 'success',
      output: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
      ],
      meta: {
        engine: 'ModelsLab Inpainting Realtime (Simulated Mode)',
        prompt: enrichedPrompt,
        initImageProvided: true
      }
    };
  }

  try {
    const response = await fetch(MODELSLAB_INPAINT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        prompt: enrichedPrompt,
        negative_prompt: negativePrompt,
        init_image: initImage,
        mask_image: maskImage,
        num_inference_steps: '30',
        guidance_scale: 8.0
      })
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('ModelsLab Inpaint call failed:', err.message);
    throw err;
  }
}

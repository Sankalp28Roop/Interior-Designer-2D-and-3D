/**
 * Multilingual Prompt Enhancement & Architectural Expansion Engine
 * Uses Gemini API (with resilient offline translation/architectural enhancement fallback).
 */

const HINDI_DEVANAGARI_REGEX = /[\u0900-\u097F]/;

const HINDI_PHONETIC_KEYWORDS = [
  'kamra', 'kamre', 'deewar', 'diwar', 'furniture', 'kursi', 'mez', 'sofa',
  'roshni', 'parde', 'rang', 'kripya', 'chahiye', 'banao', 'badlo', 'karo',
  'gharpentry', 'mandir', 'balkani', 'drawing room', 'chhat', 'farsh'
];

export function detectLanguage(text) {
  if (!text) return 'en';
  if (HINDI_DEVANAGARI_REGEX.test(text)) return 'hi';
  
  const lower = text.toLowerCase();
  for (const kw of HINDI_PHONETIC_KEYWORDS) {
    if (lower.includes(kw)) return 'hi-Latn'; // Hinglish
  }
  return 'en';
}

export function classifyIntent(text) {
  const lower = text.toLowerCase();
  
  // 3D Mesh / Dollhouse / Whole House / New Generation cues (prioritize new generation over subtle word substrings)
  if (
    lower.includes('dollhouse') ||
    lower.includes('isometric') ||
    lower.includes('cutaway') ||
    lower.includes('village house') ||
    lower.includes('mountain') ||
    lower.includes('apartment') ||
    lower.includes('floorplan') ||
    lower.includes('courtyard') ||
    lower.includes('3d model') ||
    lower.includes('glb') ||
    lower.includes('mesh')
  ) {
    return 'GENERATE_3D_DOLLHOUSE';
  }

  // Inpainting cues (require word boundary / specific phrase so words like 'fireplace' don't trigger 'replace')
  if (
    lower.includes('inpaint') ||
    lower.includes('keep layout') ||
    lower.includes('change wall') ||
    /\breplace\b/.test(lower) ||
    lower.includes('badal do') ||
    lower.includes('sirf deewar') ||
    lower.includes('modify floor') ||
    lower.includes('color to') ||
    /\bedit\b/.test(lower)
  ) {
    return 'INPAINT_EDIT';
  }

  // Default to 2D scene generation
  return 'GENERATE_2D_SCENE';
}

/**
 * High-quality algorithmic fallback if LLM service is offline or unreachable
 */
function localEnhance(prompt, detectedLang, intent) {
  let englishBase = prompt;

  if (detectedLang === 'hi' || detectedLang === 'hi-Latn') {
    // Basic translation dictionary for common Hindi spatial words
    const dict = [
      [/ek sundar kamra/gi, 'a beautiful living room'],
      [/kamra|kamre/gi, 'living space'],
      [/deewar|diwar/gi, 'accent wall'],
      [/charcoal brick/gi, 'textured charcoal brick'],
      [/kursi/gi, 'sculptural armchair'],
      [/mez/gi, 'minimalist oak coffee table'],
      [/roshni/gi, 'warm natural illumination'],
      [/farsh/gi, 'matte herringbone hardwood floor'],
      [/chhat/gi, 'recessed architectural ceiling'],
      [/badlo|badal do/gi, 'modify and update'],
      [/kripya/gi, 'please']
    ];
    for (const [re, rep] of dict) {
      englishBase = englishBase.replace(re, rep);
    }
  }

  // Avoid nesting "Detailed 3D architectural interior dollhouse cutaway of" if user already wrote it
  const cleanBase = englishBase.replace(/^(Detailed 3D architectural interior dollhouse cutaway of\s*)+/gi, '').trim();

  let styleModifiers = 'Japandi aesthetic, warm neutral palette, architectural photography, hyper-detailed textures, Octane 3D render look';
  let camera = 'isometric cutaway dollhouse view with crisp shadows';
  let lighting = 'morning golden hour sunlight with soft volumetric rays through large crittall windows';

  if (intent === 'INPAINT_EDIT') {
    return {
      enhancedPrompt: `${cleanBase}, seamless interior architectural edit, photorealistic material match, cinematic 8k lighting, exact edge blending`,
      cameraAngle: 'straight-on architectural perspective',
      lighting: 'soft diffused studio lighting',
      materials: ['charcoal brick', 'white oak', 'brushed brass']
    };
  }

  if (intent === 'GENERATE_3D_DOLLHOUSE') {
    return {
      enhancedPrompt: `Detailed 3D architectural interior dollhouse cutaway of ${cleanBase}, ${styleModifiers}, ${camera}, ${lighting}, high polygon clean topology, PBR materials`,
      cameraAngle: '45-degree isometric axonometric cutaway',
      lighting: lighting,
      materials: ['beige bouclé', 'fluted white oak', 'brushed brass', 'raw travertine']
    };
  }

  return {
    enhancedPrompt: `Ultra-high-definition architectural interior photograph of ${cleanBase}, ${styleModifiers}, wide-angle perspective, ${lighting}, featured in Architectural Digest`,
    cameraAngle: 'wide-angle eye-level perspective',
    lighting: lighting,
    materials: ['limewash plaster', 'matte concrete', 'warm bouclé', 'smoked glass']
  };
}

export async function callGeminiEnhancer(rawPrompt, apiKey) {
  const detectedLang = detectLanguage(rawPrompt);
  const detectedIntent = classifyIntent(rawPrompt);

  if (!apiKey || apiKey === 'mock_key_or_set_your_own') {
    const local = localEnhance(rawPrompt, detectedLang, detectedIntent);
    return {
      detectedLanguage: detectedLang,
      translatedPrompt: rawPrompt,
      enhancedPrompt: local.enhancedPrompt,
      intent: detectedIntent,
      metadata: {
        lighting: local.lighting,
        cameraAngle: local.cameraAngle,
        materials: local.materials,
        engine: 'AtelierAI Rule-Based Architectural Engine'
      }
    };
  }

  const systemInstruction = `You are an elite Architectural & Interior Design Prompt Engineer for "AtelierAI".
Given a user query (which might be in Hindi, Hinglish, or English):
1. Detect language ('hi', 'hi-Latn', or 'en').
2. Accurately translate Hindi or Hinglish into sophisticated English interior design terminology.
3. Classify intent strictly as one of:
   - "GENERATE_2D_SCENE" (default room views, renders)
   - "GENERATE_3D_DOLLHOUSE" (isometric cutaways, 3D meshes, room models)
   - "INPAINT_EDIT" (modifying specific parts of an existing render, e.g. "change walls to charcoal brick")
4. Enrich the prompt into a production-grade generative interior prompt with:
   - Specific architectural style (e.g., Japandi, Warm Minimalism, Modern Bauhaus)
   - Physical materials (e.g., travertine, limewash plaster, brushed brass, bouclé)
   - Camera perspective (e.g., isometric cutaway dollhouse, 24mm wide angle, straight eye-level)
   - Diurnal lighting modifiers (e.g., morning golden hour, diffused overcast daylight, moody twilight).
Return STRICT JSON ONLY matching this schema:
{
  "detectedLanguage": "hi" | "hi-Latn" | "en",
  "translatedPrompt": "English translation without fillers",
  "enhancedPrompt": "Expanded rich architectural prompt ready for image/3D generation",
  "intent": "GENERATE_2D_SCENE" | "GENERATE_3D_DOLLHOUSE" | "INPAINT_EDIT",
  "suggestedLighting": "string",
  "suggestedCamera": "string",
  "suggestedMaterials": ["string", "string"],
  "suggestedColorPalette": ["#HEX", "#HEX", "#HEX"]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\nUser Input: "${rawPrompt}"` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}, falling back to local enhancer.`);
      const local = localEnhance(rawPrompt, detectedLang, detectedIntent);
      return {
        detectedLanguage: detectedLang,
        translatedPrompt: rawPrompt,
        enhancedPrompt: local.enhancedPrompt,
        intent: detectedIntent,
        metadata: {
          lighting: local.lighting,
          cameraAngle: local.cameraAngle,
          materials: local.materials,
          engine: 'fallback'
        }
      };
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(candidateText);

    return {
      detectedLanguage: parsed.detectedLanguage || detectedLang,
      translatedPrompt: parsed.translatedPrompt || rawPrompt,
      enhancedPrompt: parsed.enhancedPrompt || rawPrompt,
      intent: parsed.intent || detectedIntent,
      metadata: {
        lighting: parsed.suggestedLighting,
        cameraAngle: parsed.suggestedCamera,
        materials: parsed.suggestedMaterials || [],
        colorPalette: parsed.suggestedColorPalette || ['#F3EFE6', '#D4AF37', '#24272C'],
        engine: 'Gemini 1.5 Flash'
      }
    };
  } catch (err) {
    console.error('Gemini enhancer call error:', err.message);
    const local = localEnhance(rawPrompt, detectedLang, detectedIntent);
    return {
      detectedLanguage: detectedLang,
      translatedPrompt: rawPrompt,
      enhancedPrompt: local.enhancedPrompt,
      intent: detectedIntent,
      metadata: {
        lighting: local.lighting,
        cameraAngle: local.cameraAngle,
        materials: local.materials,
        engine: 'fallback'
      }
    };
  }
}

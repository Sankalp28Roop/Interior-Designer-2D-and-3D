# AtelierAI — Production Node.js & Express Backend Architecture

Production-grade spatial interior design backend for **AtelierAI**, powering interactive 3D dollhouse cutaways, 2D photorealistic renders, multilingual prompt enhancement (Hindi/Hinglish to English), multi-turn inpainting, true 3D asset extraction (GLB + PBR maps), and architectural client specification PDF compilation.

---

## 🏗️ System Architecture & Directory Structure

```
server/
├── .env                  # Environment secrets & API configuration
├── .env.example          # Template environment file
├── package.json          # ESM package definition with dependencies
├── data/
│   └── atelierai.db      # High-performance SQLite database (WAL mode)
├── test/
│   └── backend.test.js   # Automated integration test suite (8 tests)
└── src/
    ├── server.js         # Express app entry, security headers (Helmet, CORS)
    ├── config/
    │   └── database.js   # Schema definition (users, projects, chats, jobs)
    ├── middleware/
    │   └── auth.js       # JWT authentication & optionalAuth middleware
    ├── controllers/
    │   ├── authController.js       # Signup, login, and user profile management
    │   ├── projectController.js    # Projects, swatches, materials, and chat history
    │   ├── promptController.js     # Multilingual prompt enhancer & classifier
    │   ├── generateController.js   # 2D, inpaint, and 3D orchestration
    │   └── exportController.js     # PDFKit architectural client spec generator
    ├── routes/
    │   ├── authRoutes.js           # /api/auth/*
    │   ├── projectRoutes.js        # /api/projects/*
    │   ├── promptRoutes.js         # /api/prompt/*
    │   ├── generateRoutes.js       # /api/generate/*
    │   └── exportRoutes.js         # /api/export/*
    ├── services/
    │   ├── promptEnhancer.js       # Gemini 1.5 Flash + Rule-based fallback
    │   ├── modelsLabService.js     # ModelsLab Interior & Inpainting API
    │   └── meshyService.js         # Meshy AI Text/Image-to-3D with polling
    └── utils/
        └── helpers.js              # ID generators, safe JSON parsers
```

---

## ⚡ Quick Start & Running the Server

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=atelierai_super_secret_jwt_key_2026_production_grade
JWT_EXPIRES_IN=7d

# Gemini API Key (multilingual prompt enhancer & classification)
GEMINI_API_KEY=your_gemini_api_key

# ModelsLab Interior & Inpainting API
MODELSLAB_API_KEY=your_modelslab_api_key

# Meshy 3D API (Text-to-3D & Image-to-3D)
MESHY_API_KEY=your_meshy_api_key
```

### 3. Start Development Server
```bash
npm run dev
# or: npm start
```
- **Backend API**: `http://localhost:5000/api/health`
- **Interactive 3D Studio Preview**: `http://localhost:5000/studio/code.html`

### 4. Run Test Suite
```bash
npm test
```
All 8 integration test suites pass with 100% coverage across auth, prompt enhancement, intent classification, 2D generation, inpainting, 3D extraction, and PDF export.

---

## 📡 API Endpoints Specification

### 1. User Authentication & Project Persistence
- `POST /api/auth/signup`: Create a designer account (bcrypt password hashing, returns JWT).
- `POST /api/auth/login`: Authenticate existing designer and issue JWT.
- `GET /api/auth/me`: Retrieve current authenticated profile.
- `GET /api/projects`: List all design projects for the authenticated user.
- `POST /api/projects`: Create a new 3D/2D project with swatches, materials, and lighting presets.
- `GET /api/projects/:id`: Get full project state.
- `PUT /api/projects/:id`: Update render links, 3D models, or material lists.
- `GET /api/projects/:id/chat`: Retrieve multi-turn chat consultation history.

### 2. Multilingual Prompt Enhancer
- `POST /api/prompt/enhance`
  - Accepts raw user chat input in **Hindi (Devanagari)**, **Hinglish**, or **English**.
  - Powered by **Google Gemini API** (`process.env.GEMINI_API_KEY`) with an automated architectural fallback engine.
  - Returns:
    * `detectedLanguage`: `'hi'`, `'hi-Latn'`, or `'en'`
    * `translatedPrompt`: Accurate English architectural translation
    * `enhancedPrompt`: Enriched prompt with lighting, materials, and perspective
    * `intent`: `'GENERATE_2D_SCENE'`, `'GENERATE_3D_DOLLHOUSE'`, or `'INPAINT_EDIT'`
    * `metadata`: Suggested lighting, camera angles, color swatches, and material tags.

### 3. AI Generation Orchestration
- `POST /api/generate/2d`
  - Connects to ModelsLab Interior API.
  - Supports style presets (`Japandi & Warm Minimalism`, `Modern Bauhaus`, `Industrial Loft`, etc.).
  - Supports diurnal lighting modifiers (`Morning Golden Hour`, `Midday`, `Moody Twilight`).
  - Supports camera angle modifiers (`Wide-angle Perspective`, `Isometric Cutaway Dollhouse`, `Top-down Floorplan`).
- `POST /api/generate/inpaint`
  - Connects to ModelsLab Inpainting endpoint for multi-turn conversational room edits (e.g. "Keep layout, change walls to charcoal brick").
- `POST /api/generate/3d`
  - Connects to Meshy AI API.
  - Supports **Text-to-3D** and **Image-to-3D** asset extraction.
  - Implements an asynchronous polling mechanism (`pollMeshyTaskUntilDone`) that checks progress until `SUCCEEDED` and returns the `.glb` model URL and PBR texture maps (diffuse, normal, roughness).
- `GET /api/generate/status/:jobId`: Query status of any running async generation job.

### 4. Client Spec Sheet & PDF Export
- `POST /api/export/spec-pdf`
- `GET /api/export/spec-pdf/:projectId`
  - Accepts a `projectId`.
  - Generates a branded executive dark-theme architectural specification PDF using PDFKit:
    * Project overview and spatial intent
    * Render links and 3D GLB model download links
    * Rendered HEX color swatches (`#F3EFE6`, `#D4AF37`, etc.)
    * Comprehensive Bill of Materials (BOM) finish schedule.

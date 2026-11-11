import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(__dirname, '../..', process.env.DATABASE_PATH)
  : path.join(dbDir, 'atelierai.db');

export const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'designer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Ensure default guest user exists for unauthenticated/demo testing
    INSERT OR IGNORE INTO users (id, email, password_hash, name, role)
    VALUES ('guest_user', 'guest@atelierai.design', 'demo_hash', 'Guest Designer', 'guest');

    -- Projects Table (3D/2D Project History)

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      style_preset TEXT,
      diurnal_lighting TEXT,
      camera_angle TEXT,
      current_prompt TEXT,
      render_2d_url TEXT,
      model_3d_url TEXT,
      pbr_textures TEXT, -- JSON stringified map { diffuse, normal, roughness }
      color_swatches TEXT, -- JSON array of HEX strings
      materials_list TEXT, -- JSON array of material items
      metadata TEXT, -- JSON arbitrary metadata
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Chat Sessions Table
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT DEFAULT 'Interior Design Consultation',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Chat Messages Table
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
      original_text TEXT NOT NULL,
      detected_language TEXT DEFAULT 'en',
      enhanced_prompt TEXT,
      classified_intent TEXT,
      payload TEXT, -- JSON for attachments or generation links
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    -- AI Generation Jobs Table (Async Meshy / ModelsLab queue)
    CREATE TABLE IF NOT EXISTS generation_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT,
      service TEXT NOT NULL, -- 'modelslab' | 'meshy'
      job_type TEXT NOT NULL, -- '2d_interior' | 'inpaint' | 'text_to_3d' | 'image_to_3d'
      status TEXT NOT NULL, -- 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'
      external_task_id TEXT,
      progress INTEGER DEFAULT 0,
      input_params TEXT, -- JSON
      output_result TEXT, -- JSON
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

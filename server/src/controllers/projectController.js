import { db } from '../config/database.js';
import { generateId, safeJsonParse, safeJsonStringify } from '../utils/helpers.js';

export function listProjects(req, res) {
  try {
    const userId = req.user.id;
    const stmt = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC');
    const projects = stmt.all(userId).map(p => ({
      ...p,
      pbr_textures: safeJsonParse(p.pbr_textures, {}),
      color_swatches: safeJsonParse(p.color_swatches, []),
      materials_list: safeJsonParse(p.materials_list, []),
      metadata: safeJsonParse(p.metadata, {})
    }));

    return res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('List projects error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch projects.' });
  }
}

export function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = stmt.get(id);

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    return res.json({
      success: true,
      project: {
        ...project,
        pbr_textures: safeJsonParse(project.pbr_textures, {}),
        color_swatches: safeJsonParse(project.color_swatches, []),
        materials_list: safeJsonParse(project.materials_list, []),
        metadata: safeJsonParse(project.metadata, {})
      }
    });
  } catch (err) {
    console.error('Get project error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve project.' });
  }
}

export function createProject(req, res) {
  try {
    const userId = req.user.id;
    const {
      title = 'Untitled Atelier Scene',
      description = '',
      style_preset = 'Japandi & Warm Minimalism',
      diurnal_lighting = 'Morning Golden Hour',
      camera_angle = 'Isometric Cutaway Dollhouse',
      current_prompt = '',
      render_2d_url = '',
      model_3d_url = '',
      pbr_textures = {},
      color_swatches = ['#F3EFE6', '#D4AF37', '#8E4A23', '#24272C'],
      materials_list = ['Beige Bouclé Fabric', 'Brushed Architectural Brass', 'Cognac Saddle Leather', 'Fluted Charcoal Timber'],
      metadata = {}
    } = req.body;

    const id = generateId('proj');
    const insertStmt = db.prepare(`
      INSERT INTO projects (
        id, user_id, title, description, style_preset, diurnal_lighting,
        camera_angle, current_prompt, render_2d_url, model_3d_url,
        pbr_textures, color_swatches, materials_list, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id, userId, title, description, style_preset, diurnal_lighting,
      camera_angle, current_prompt, render_2d_url, model_3d_url,
      safeJsonStringify(pbr_textures),
      safeJsonStringify(color_swatches),
      safeJsonStringify(materials_list),
      safeJsonStringify(metadata)
    );

    // Create an initial chat session for this project
    const sessionId = generateId('chat');
    db.prepare(`
      INSERT INTO chat_sessions (id, project_id, user_id, title)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, id, userId, `${title} - Consultation`);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      projectId: id,
      sessionId
    });
  } catch (err) {
    console.error('Create project error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create project.' });
  }
}

export function updateProject(req, res) {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id, user_id FROM projects WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    const {
      title,
      description,
      style_preset,
      diurnal_lighting,
      camera_angle,
      current_prompt,
      render_2d_url,
      model_3d_url,
      pbr_textures,
      color_swatches,
      materials_list,
      metadata
    } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (style_preset !== undefined) { updates.push('style_preset = ?'); values.push(style_preset); }
    if (diurnal_lighting !== undefined) { updates.push('diurnal_lighting = ?'); values.push(diurnal_lighting); }
    if (camera_angle !== undefined) { updates.push('camera_angle = ?'); values.push(camera_angle); }
    if (current_prompt !== undefined) { updates.push('current_prompt = ?'); values.push(current_prompt); }
    if (render_2d_url !== undefined) { updates.push('render_2d_url = ?'); values.push(render_2d_url); }
    if (model_3d_url !== undefined) { updates.push('model_3d_url = ?'); values.push(model_3d_url); }
    if (pbr_textures !== undefined) { updates.push('pbr_textures = ?'); values.push(safeJsonStringify(pbr_textures)); }
    if (color_swatches !== undefined) { updates.push('color_swatches = ?'); values.push(safeJsonStringify(color_swatches)); }
    if (materials_list !== undefined) { updates.push('materials_list = ?'); values.push(safeJsonStringify(materials_list)); }
    if (metadata !== undefined) { updates.push('metadata = ?'); values.push(safeJsonStringify(metadata)); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const updateSql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(updateSql).run(...values);

    return res.json({ success: true, message: 'Project updated successfully.' });
  } catch (err) {
    console.error('Update project error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update project.' });
  }
}

export function getProjectChat(req, res) {
  try {
    const { id } = req.params;
    const session = db.prepare('SELECT * FROM chat_sessions WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(id);

    if (!session) {
      return res.json({ success: true, session: null, messages: [] });
    }

    const messages = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(session.id);
    const parsedMessages = messages.map(m => ({
      ...m,
      payload: safeJsonParse(m.payload, {})
    }));

    return res.json({
      success: true,
      session,
      messages: parsedMessages
    });
  } catch (err) {
    console.error('Get project chat error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve chat history.' });
  }
}

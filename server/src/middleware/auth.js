import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token missing. Please sign in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atelierai_default_secret_key');
    const userStmt = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?');
    const user = userStmt.get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired session token.'
    });
  }
}

// Optional Auth middleware (populates req.user if present, but doesn't block guests)
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = { id: 'guest_user', email: 'guest@atelierai.design', name: 'Guest Designer', role: 'guest' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atelierai_default_secret_key');
    const userStmt = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?');
    const user = userStmt.get(decoded.userId);
    req.user = user || { id: 'guest_user', email: 'guest@atelierai.design', name: 'Guest Designer', role: 'guest' };
  } catch {
    req.user = { id: 'guest_user', email: 'guest@atelierai.design', name: 'Guest Designer', role: 'guest' };
  }
  next();
}

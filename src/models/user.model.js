const db = require("../config/database");

// Format a raw DB row to a clean JS object
function format(row) {
  if (!row) return null;
  return {
    id:         row.id,
    username:   row.username,
    email:      row.email,
    fullName:   row.full_name,
    avatarUrl:  row.avatar_url,
    status:     row.status === 1,
    roleId:     row.role_id,
    loginCount: row.login_count,
    isDeleted:  row.is_deleted === 1,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
}

// Format row and attach role object
function formatWithRole(row) {
  if (!row) return null;
  const user = format(row);
  if (row.role_id && row.role_name) {
    user.role = {
      id:          row.role_id,
      name:        row.role_name,
      description: row.role_description,
      createdAt:   row.role_created_at,
      updatedAt:   row.role_updated_at,
    };
  } else {
    user.role = null;
  }
  delete user.roleId;
  return user;
}

const User = {
  // Create user (password must already be hashed)
  create({ username, password, email, fullName = "", avatarUrl, roleId, status = 0 }) {
    const stmt = db.prepare(
      `INSERT INTO users (username, password, email, full_name, avatar_url, role_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      username, password, email,
      fullName,
      avatarUrl || "https://i.sstatic.net/l60Hf.png",
      roleId || null,
      status ? 1 : 0
    );
    return this.findById(info.lastInsertRowid);
  },

  // Get all active users with role info
  findAll() {
    const rows = db.prepare(`
      SELECT u.*,
             r.name        AS role_name,
             r.description AS role_description,
             r.created_at  AS role_created_at,
             r.updated_at  AS role_updated_at
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id AND r.is_deleted = 0
      WHERE u.is_deleted = 0
      ORDER BY u.id ASC
    `).all();
    return rows.map(formatWithRole);
  },

  // Find active user by id (with role)
  findById(id) {
    const row = db.prepare(`
      SELECT u.*,
             r.name        AS role_name,
             r.description AS role_description,
             r.created_at  AS role_created_at,
             r.updated_at  AS role_updated_at
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id AND r.is_deleted = 0
      WHERE u.id = ? AND u.is_deleted = 0
    `).get(id);
    return formatWithRole(row);
  },

  // Find active user by username AND email
  findByUsernameAndEmail(username, email) {
    const row = db.prepare(`
      SELECT u.*,
             r.name        AS role_name,
             r.description AS role_description,
             r.created_at  AS role_created_at,
             r.updated_at  AS role_updated_at
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id AND r.is_deleted = 0
      WHERE u.username = ? AND u.email = ? AND u.is_deleted = 0
    `).get(username, email);
    return formatWithRole(row);
  },

  // Get raw row (with password) by id
  findRawById(id) {
    return db.prepare(`SELECT * FROM users WHERE id = ? AND is_deleted = 0`).get(id);
  },

  // Update user fields
  update(id, fields) {
    const allowed = ["username", "password", "email", "full_name", "avatar_url", "role_id", "status", "login_count"];
    const setClauses = [];
    const values = [];
    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key) && val !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (setClauses.length === 0) return this.findById(id);
    setClauses.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE users SET ${setClauses.join(", ")} WHERE id = ? AND is_deleted = 0`).run(...values);
    return this.findById(id);
  },

  // Soft delete
  softDelete(id) {
    const info = db
      .prepare(`UPDATE users SET is_deleted = 1, updated_at = datetime('now') WHERE id = ? AND is_deleted = 0`)
      .run(id);
    return info.changes > 0;
  },
};

module.exports = User;

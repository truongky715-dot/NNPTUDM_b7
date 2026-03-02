const db = require("../config/database");

const Role = {
  // Create a new role
  create({ name, description = "" }) {
    const stmt = db.prepare(
      `INSERT INTO roles (name, description) VALUES (?, ?)`
    );
    const info = stmt.run(name, description);
    return this.findById(info.lastInsertRowid);
  },

  // Get all active roles
  findAll() {
    return db
      .prepare(`SELECT * FROM roles WHERE is_deleted = 0 ORDER BY id ASC`)
      .all();
  },

  // Find active role by id
  findById(id) {
    return db
      .prepare(`SELECT * FROM roles WHERE id = ? AND is_deleted = 0`)
      .get(id);
  },

  // Find active role by name
  findByName(name) {
    return db
      .prepare(`SELECT * FROM roles WHERE name = ? AND is_deleted = 0`)
      .get(name);
  },

  // Update role
  update(id, { name, description }) {
    const fields = [];
    const values = [];
    if (name !== undefined)        { fields.push("name = ?");        values.push(name); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (fields.length === 0) return this.findById(id);
    fields.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE roles SET ${fields.join(", ")} WHERE id = ? AND is_deleted = 0`).run(...values);
    return this.findById(id);
  },

  // Soft delete
  softDelete(id) {
    const info = db
      .prepare(`UPDATE roles SET is_deleted = 1, updated_at = datetime('now') WHERE id = ? AND is_deleted = 0`)
      .run(id);
    return info.changes > 0;
  },
};

module.exports = Role;

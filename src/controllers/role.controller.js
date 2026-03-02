const Role = require("../models/role.model");

// POST /roles - Create new role
const createRole = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Role name is required" });
    }

    // Check duplicate
    if (Role.findByName(name)) {
      return res.status(400).json({ success: false, message: "Role name already exists" });
    }

    const role = Role.create({ name, description });
    return res.status(201).json({ success: true, data: role });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /roles - Get all roles
const getAllRoles = (req, res) => {
  try {
    const roles = Role.findAll();
    return res.status(200).json({ success: true, data: roles });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /roles/:id - Get role by id
const getRoleById = (req, res) => {
  try {
    const role = Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }
    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /roles/:id - Update role
const updateRole = (req, res) => {
  try {
    const { name, description } = req.body;

    if (!Role.findById(req.params.id)) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    // Check duplicate name (excluding current role)
    if (name) {
      const existing = Role.findByName(name);
      if (existing && existing.id != req.params.id) {
        return res.status(400).json({ success: false, message: "Role name already exists" });
      }
    }

    const role = Role.update(req.params.id, { name, description });
    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /roles/:id - Soft delete
const deleteRole = (req, res) => {
  try {
    const deleted = Role.softDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }
    return res.status(200).json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};

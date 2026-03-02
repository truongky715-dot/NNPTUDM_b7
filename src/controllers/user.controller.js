const User = require("../models/user.model");
const Role = require("../models/role.model");
const bcrypt = require("bcryptjs");

// POST /users - Create new user
const createUser = async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role: roleId, status } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: "username, password and email are required" });
    }

    // Check role exists if provided
    if (roleId) {
      const existingRole = Role.findById(roleId);
      if (!existingRole) {
        return res.status(404).json({ success: false, message: "Role not found" });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = User.create({ username, password: hashed, email, fullName, avatarUrl, roleId, status });

    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE")) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /users - Get all users (isDeleted = false), with role, no password
const getAllUsers = (req, res) => {
  try {
    const users = User.findAll();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /users/:id - Get user by id, with role, no password
const getUserById = (req, res) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /users/:id - Update user
const updateUser = async (req, res) => {
  try {
    const { username, email, fullName, avatarUrl, role: roleId, status, password } = req.body;

    if (!User.findById(req.params.id)) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check role exists if being updated
    if (roleId) {
      const existingRole = Role.findById(roleId);
      if (!existingRole) {
        return res.status(404).json({ success: false, message: "Role not found" });
      }
    }

    const updateData = {};
    if (username  !== undefined) updateData.username  = username;
    if (email     !== undefined) updateData.email     = email;
    if (fullName  !== undefined) updateData.full_name = fullName;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
    if (roleId    !== undefined) updateData.role_id   = roleId;
    if (status    !== undefined) updateData.status    = status ? 1 : 0;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = User.update(req.params.id, updateData);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE")) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /users/:id - Soft delete
const deleteUser = (req, res) => {
  try {
    const deleted = User.softDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /users/enable
const enableUser = (req, res) => {
  try {
    const { email, username } = req.body;
    const user = User.findByUsernameAndEmail(username, email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const updated = User.update(user.id, { status: 1 });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /users/disable
const disableUser = (req, res) => {
  try {
    const { email, username } = req.body;
    const user = User.findByUsernameAndEmail(username, email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const updated = User.update(user.id, { status: 0 });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
};

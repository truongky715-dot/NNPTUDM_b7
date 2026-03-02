const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
} = require("../controllers/user.controller");

// Enable / Disable (must be before /:id to avoid conflict)
router.post("/enable", enableUser);
router.post("/disable", disableUser);

// CRUD
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;

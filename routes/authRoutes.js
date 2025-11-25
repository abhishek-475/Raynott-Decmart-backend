const express = require("express");
const { 
    register, 
    login, 
    registerAdmin, 
    createAdmin, 
    getUsers, 
    updateUserRole,
    deleteUser
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/register", registerAdmin); // For initial setup
router.post("/create-admin", protect, admin, createAdmin); // For existing admins
router.get("/users", protect, admin, getUsers); // Get all users
router.put("/users/:id/role", protect, admin, updateUserRole); // Update user role
router.delete("/users/:id", protect, admin, deleteUser); // Delete user

module.exports = router;
const express = require("express");
const { 
    register, 
    login, 
    registerAdmin, 
    createAdmin, 
    getUsers, 
    updateUserRole 
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/register", registerAdmin); // For initial setup
router.post("/create-admin", protect, admin, createAdmin); // For existing admins
router.get("/users", protect, admin, getUsers); // Get all users
router.put("/users/:id/role", protect, admin, updateUserRole); // Update user role

module.exports = router;
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "User already exists" });

        const user = await User.create({
            name,
            email,
            password,
        });

        res.status(201).json({
            _id: user._id,
            name,
            email,
            token: generateToken(user._id),
            isAdmin: user.isAdmin,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user._id,
                email,
                name: user.name,
                token: generateToken(user._id),
                isAdmin: user.isAdmin,
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
};


exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "User already exists" });

        const user = await User.create({
            name,
            email,
            password,
            isAdmin: true  // Set as admin directly
        });

        res.status(201).json({
            _id: user._id,
            name,
            email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
            message: "Admin user created successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Admin registration failed" });
    }
};


exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "User already exists" });

        const user = await User.create({
            name,
            email,
            password,
            isAdmin: true
        });

        res.status(201).json({
            _id: user._id,
            name,
            email,
            isAdmin: user.isAdmin,
            message: "Admin user created successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Admin creation failed" });
    }
};


exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};


exports.updateUserRole = async (req, res) => {
    try {
        const { isAdmin } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent self-demotion
        if (user._id.toString() === req.user._id.toString() && isAdmin === false) {
            return res.status(400).json({ message: "Cannot remove your own admin role" });
        }

        user.isAdmin = isAdmin;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            message: "User role updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update user role" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully",
            deletedUser: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete user" });
    }
};



exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch profile",
      error: error.message 
    });
  }
};





// controllers/authController.js - updateProfile function
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Validate required fields
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    if (!req.body.email || !req.body.email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.user._id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    // Update allowed fields
    user.name = req.body.name.trim();
    user.email = req.body.email.trim().toLowerCase();
    user.phone = req.body.phone ? req.body.phone.trim() : user.phone;
    user.address = req.body.address ? req.body.address.trim() : user.address;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt
      }
    });
    
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
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
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── 1. REGISTER / SIGNUP CONTROLLER ───
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Username or Email already exists" });
        }

        // Create new user
        const user = await User.create({ username, email, password });

        // Token generation
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.cookie('token', token);

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ─── 2. LOGIN CONTROLLER ───
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.cookie('token', token);

        return res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ─── 3. LOGOUT CONTROLLER ───
export const logoutUser = async (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ success: true, message: "Logged out successfully!" });
};
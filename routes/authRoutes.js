const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Email Registration
router.post('/register/email', async (req, res) => {
    console.dir(req.body)
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Phone Registration (Placeholder - Implement OTP Verification)
router.post('/register/phone', async (req, res) => {
    const { name, phone } = req.body;
    try {
        console.dir(phone)
        const existingUser = await User.findOne({ phone });
        console.dir(existingUser)
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User({ name, phone });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;

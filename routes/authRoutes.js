const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Email Registration
router.post('/register/email', async (req, res) => {
    const { name, email, password } = req.body;
    try {
         // Check for missing required fields
         if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

          // Email Validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              return res.status(400).json({ message: "Invalid email format" });
          }

          const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&+=!]{8,}$/;
          if (!passwordRegex.test(password)) {
              return res.status(400).json({
                  message: "Password must be at least 8 characters long and contain at least one letter and one number"
              });
          }
        const existingUser = await User.findOne({    // replacement for findone({email}),..so that db call goes only once
            $or: [{ email }, { name }]
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: `User already exists with email: ${email}` });
            }
            if (existingUser.name === name) {
                return res.status(400).json({ message: `User already exists with name: ${name}` });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        console.log("User saved:", user);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user
         });
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

router.post('/login',async(req,res)=>{
    const{email,password} = req.body;
    if(!email || !password) return res.status(400).json({
        message:'Missing required fields!'
    })
    const user= await User.findOne({email})
    if(!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({
        message:'Invalid email or password!'
    })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token,user });
})
router.delete('/users/delete-all', async (req, res) => {
    try {
        const result = await User.deleteMany({});  // Deletes all documents in the "users" collection

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No users found to delete" });
        }

        res.status(200).json({ message: "All users deleted successfully", deletedCount: result.deletedCount });
    } catch (error) {
        console.error("Error deleting users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;

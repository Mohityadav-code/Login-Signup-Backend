// const User = require('../models/user');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const dotenv = require('dotenv');

// dotenv.config();

// const jwtSecret = process.env.JWT_SECRET;
// const emailUser = process.env.EMAIL_USER;
// const emailPass = process.env.EMAIL_PASS;

// exports.register = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const user = new User({
//       username,
//       email,
//       password,
//     });

//     await user.save();

//     const payload = { userId: user._id };
//     const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

//     res.status(201).json({ token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.login = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await User.findOne({ username });

//     if (!user) {
//       return res.status(400).json({ error: 'Invalid username or password' });
//     }

//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid username or password' });
//     }

//     const payload = { userId: user._id };
//     const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

//     res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   // To be implemented
// };

// exports.resetPassword = async (req, res) => {
//   // To be implemented
// };

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "sidsky19761@gmail.com",
    pass: "bullu@#1",
  },
});

// User registration
exports.register = async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findOne({email:req.body.email});// find method instead of findone
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password email not exists' });
    }
    
    // Check if password is correct
    console.log('req.body.password: ', req.body.password);
    const passwordMatch = await bcrypt.compare(req.body.password,user.password);
    console.log('passwordMatch: ', passwordMatch);
    console.log(user);
    console.log('req.body.password: ', req.body.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create and sign a JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.header('auth-token', token).json({ token });
  } 
  
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate one-time password
    const otp = crypto.randomBytes(3).toString('hex');

    // Save the OTP and expiration date in the user document
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with the OTP
    const mailOptions = {
      from: "sidsky19761@gmail.com",
      to: user.email,
      subject: 'Reset your password',
      text: `Your one-time password is ${otp}`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'One-time password sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update password
// Update password
exports.resetPassword = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (
      user.resetPasswordOTP !== req.body.otp ||
      Date.now() > user.resetPasswordExpires
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Update the password and remove the OTP fields from the user document 
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

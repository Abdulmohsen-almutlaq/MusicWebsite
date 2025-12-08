const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const { sendVerificationEmail } = require('../utils/email');

exports.register = async (req, res) => {
  try {
    console.log('Register Request Body:', req.body); // Debug log
    console.log('Register Request Query:', req.query); // Debug log
    
    // Allow getting data from Body (JSON) OR Query (URL params)
    const email = req.body.email || req.query.email;
    const username = req.body.username || req.query.username;
    const password = req.body.password || req.query.password;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, username, and password are required' });
    }

    // --- EMAIL VALIDATION ---
    // Allow letters, numbers, dots, underscores, hyphens, and PLUS signs
    // Decoded URL parameters might have spaces instead of +, so we handle that too if needed, 
    // but standard regex for email is:
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Debug log to see exactly what string is being tested
    console.log(`Testing email: '${email}' against regex`);

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: `Invalid email format: ${email}` });
    }
    // ------------------------

    // --- PASSWORD SECURITY CHECK ---
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&).' 
      });
    }
    // -------------------------------

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        verificationToken,
        isPrivate: req.body.isPrivate || false // Default to public
      },
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'User registered. Please check your email to verify.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    // Return JSON for API calls (Frontend Page handles the UI)
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkSiteAccess = (req, res) => {
  // If the request reaches here, it means the SiteGuard middleware 
  // has already validated the password successfully.
  res.status(200).json({ message: 'Site password is correct.' });
};

exports.login = async (req, res) => {
  try {
    console.log('Login Request Body:', req.body);
    console.log('Login Request Query:', req.query);

    const username = req.body.username || req.query.username;
    const password = req.body.password || req.query.password;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isPrivate: user.isPrivate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userData.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, isPrivate } = req.body;
    const userId = req.userData.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        username, 
        isPrivate 
      },
      select: {
        id: true,
        email: true,
        username: true,
        isPrivate: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    // Prisma error code for unique constraint violation
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userData.userId;
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Account deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

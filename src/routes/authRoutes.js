import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../dbconfig.js';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMS: 15 * 60 * 1000, // 15 mins
  max: 5, // LIMIT EACH IP TO 5 REQUESTS PER windowMS
  message: {
    error: 'Too many login attempts. Please try again in 15 mins.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Endpoint for users signing up POST /auth/signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const saltRounds = 12;

  // Validate input
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!username || !password || !email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');

    // hash the password
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    // Save the new user and hashed password to postgres
    const insertUser = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `;
    const values = [username, email, hashedPwd];

    const result = await client.query(insertUser, values);
    const userId = result.rows[0].id;

    // Insert default settings for the new user
    const insertSettings = `
      INSERT INTO user_settings (user_id)
      VALUES ($1)
    `;
    await client.query(insertSettings, [userId]);

    // Insert default stats for the new user
    const insertStats = `
      INSERT INTO user_stats (
        user_id, 
        total_pomodoro_time, 
        total_pomodoros_completed, 
        total_tasks_completed, 
        last_study_date, 
        consecutive_days_streak
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(insertStats, [userId, 0, 0, 0, null, 0]);

    // Commit transaction
    await client.query('COMMIT');

    // Create a token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });

  } catch (err) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    
    // If email/username exists
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }

    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Endpoint for users loging in POST /auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Match the credentials to a user in the database
  const getUser = `SELECT * FROM users WHERE email = $1`;
  const value = [email];

  try {
    const result = await pool.query(getUser, value);

    // If there is no user associated with the entered username
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // If the password does not match, return out of function
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Successful authentication
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(202).json({ token });

  } catch (err) {
    console.error("Login error: ", err);
    res.sendStatus(503).json({ error: "Service unavailable" });
  }
});

// Endpoint to request password reset
router.post('/forgot-password', async (req, res) => {
  // Check if a user exists with that email; if so, then retrieve the id of that user and send confirmation message
  try {
    const { email } = req.body;
    const userResult = await pool.query(`
      SELECT id
      FROM users
      WHERE email = $1  
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: "Reset link has been sent to that email address." });
    }

    const userId = userResult.rows[0].id;
    const token = crypto.randomBytes(32).toString('hex'); // reset token
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Store token and expiration in DB
    await pool.query(`
      UPDATE users
      SET reset_token = $1,
          reset_token_expires = $2
      WHERE id = $3
    `, [token, expires, userId]);

    let transporter;
    let resetLink;

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') { // Development or Testing
      // Create Ethereal test account and transporter
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      resetLink = `http://localhost:5050/reset-password?token=${token}`;
    }
    else { // Production
      // Use real smtp provider
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        }
      });
      resetLink = `http://localhost:5050/reset-password?token=${token}`;
    }

    // Send email
    const info = await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Reset your password: ${resetLink}`,
      html: `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    // Log the preview URL for development
    if (process.env.NODE_ENV === 'development') console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));

    res.status(200).json({ message: "Reset link has been sent to that email address." });
  }
  catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Endpoint for password reset
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    // Find user by token and check for expiration
    const userResult = await pool.query(`
      SELECT id, reset_token_expires
      FROM users
      WHERE reset_token = $1  
    `, [token]);

    if (
      userResult.rows.length === 0 ||
      new Date(userResult.rows[0].reset_token_expires) < new Date()
    ) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const userId = userResult.rows[0].id;
    const hashedPwd = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPwd, userId]
    );
    res.status(200).json({ message: 'Password has been reset.' });
  }
  catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Google routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect and pass token in query string
    res.redirect(`/google-success?token=${token}`);
  }
);

export default router;
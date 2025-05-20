import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../dbconfig.js';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

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
    res.json({ token });

  } catch (err) {
    console.error("Login error: ", err);
    res.sendStatus(503).json({ error: "Service unavailable" });
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
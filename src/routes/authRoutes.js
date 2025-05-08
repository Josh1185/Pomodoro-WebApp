import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../dbconfig.js';

const router = express.Router();

// Endpoint for users signing up POST /auth/signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');

    // hash the password
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    // Save the new user and hashed password to postgres
    const insertUser = `
      INSERT INTO users (username, password) 
      VALUES ($1, $2) 
      RETURNING id
    `;
    const values = [username, hashedPwd];

    const result = await client.query(insertUser, values);
    const userId = result.rows[0].id;

    // Insert default settings for the new user
    const insertSettings = `
      INSERT INTO user_settings (user_id)
      VALUES ($1)
    `;
    await client.query(insertSettings, [userId]);

    // Commit transaction
    await client.query('COMMIT');

    // Create a token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '168h' });
    res.status(201).json({ token });

  } catch (err) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.log(err);
    
    // If email/username exists
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Endpoint for users loging in POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Match the credentials to a user in the database
  const getUser = `SELECT * FROM users WHERE username = $1`;
  const value = [username];

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
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });

  } catch (err) {
    console.log("Login error: ", err);
    res.sendStatus(503).json({ error: "Service unavailable" });
  }
});

export default router;
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

  try {
    // encrypt the password
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    // Save the new user and hashed password to postgres
    const insertUser = `
      INSERT INTO users (username, password) 
      VALUES ($1, $2) 
      RETURNING id
    `;
    const values = [username, hashedPwd];

    const result = await pool.query(insertUser, values);
    const userId = result.rows[0].id;

    // Create a token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '168h' });
    res.status(201).json({ token });

  } catch (err) {
    console.log(err);
    
    // If username exists
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
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
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // If the password does not match, return out of function
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Successful authentication
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });

  } catch (err) {
    console.log(err);
    res.sendStatus(503).json({ error: "Service unavailable" });
  }
});

export default router;
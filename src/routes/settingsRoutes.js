import express from 'express';
import { pool } from '../dbconfig.js';

const router = express.Router();

// Get all settings for a logged in user GET /
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const getSettings = `
      SELECT * FROM user_settings
      WHERE user_id = $1
    `;
    const values = [userId];

    const result = await pool.query(getSettings, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(result.rows[0]);
  }
  catch (err) {
    console.log('Error fetching settings: ', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings for a logged in user PUT /
router.put('/', async (req, res) => {
  try {
    const userId = req.userId;
    const {
      pomodoro_duration,
      short_break_duration,
      long_break_duration,
      theme,
      accent_color
    } = req.body;

    const updateSettings = `
      INSERT INTO user_settings (user_id, pomodoro_duration, short_break_duration, long_break_duration, theme, accent_color)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        pomodoro_duration = EXCLUDED.pomodoro_duration,
        short_break_duration = EXCLUDED.short_break_duration,
        long_break_duration = EXCLUDED.long_break_duration,
        theme = EXCLUDED.theme,
        accent_color = EXCLUDED.accent_color
      RETURNING *
    `;
    const values = [
      userId,
      pomodoro_duration,
      short_break_duration,
      long_break_duration,
      theme,
      accent_color
    ];

    const result = await pool.query(updateSettings, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(result.rows[0]);
  }
  catch (err) {
    console.log('Error updating settings: ', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
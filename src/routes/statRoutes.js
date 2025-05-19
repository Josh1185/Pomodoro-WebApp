import express from 'express';
import { pool } from '../dbconfig.js';

const router = express.Router();

// Get all stats for a logged in user GET/
router.get('/', async (req, res) => {
  const userId = req.userId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const getUsername = `
      SELECT username 
      FROM users
      WHERE id = $1
    `; 
    const getStats = `
      SELECT * FROM user_stats
      WHERE user_id = $1
    `;
    const values = [userId];

    const usernameResult = await client.query(getUsername, values);
    const statsResult = await client.query(getStats, values);
    if (statsResult.rows.length === 0 || usernameResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Stats not found' });
    }

    res.json({
      username: usernameResult.rows[0],
      stats: statsResult.rows[0]
    });
  }
  catch (err) {
    await client.query('ROLLBACK');
    console.log('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
  finally {
    client.release();
  }
});

// Update stats for a completed timer PUT /update
router.put('/update', async (req, res) => {
  const { pomodoroTime } = req.body;
  const userId = req.userId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const today = new Date().toISOString().slice(0, 10);

    const { rows } = await client.query(`
      SELECT last_study_date, consecutive_days_streak
      FROM user_stats
      WHERE user_id = $1
    `, [userId]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User stats not found' });
    }

    // Streak logic
    const { last_study_date, consecutive_days_streak } = rows[0];
    let newStreak = consecutive_days_streak;

    if (!last_study_date) {
      newStreak = 1;
    }
    else {
      const lastDate = new Date(last_study_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.toDateString() === yesterday.toDateString()) {
        newStreak += 1;
      }
      else if (lastDate.toDateString() !== new Date().toDateString()) {
        newStreak = 1;
      }
    }

    // Update stats query
    await client.query(`
      UPDATE user_stats
      SET total_pomodoro_time = total_pomodoro_time + $1,
          total_pomodoros_completed = total_pomodoros_completed + 1,
          last_study_date = $2,
          consecutive_days_streak = $3
      WHERE user_id = $4
    `, [pomodoroTime, today, newStreak, userId]);

    await client.query('COMMIT');
    res.json({ message: 'User stats updated successfully' });
  }
  catch (err) {
    await client.query('ROLLBACK');
    console.log('Error updating stats: ', err);
    res.status(500).json({ error: 'Internal server error' });
  }
  finally {
    client.release();
  }
});

// Log pomodoro sessions
router.post('/log-session', async (req, res) => {
  const userId = req.userId;
  const { duration_minutes, task_id } = req.body;

  try {
    await pool.query(`
      INSERT INTO pomodoro_sessions (user_id, task_id, duration_minutes)
      VALUES  ($1, $2, $3)
    `, [userId, task_id || null, duration_minutes]);

    res.status(201).json({ message: 'Session logged successfully' });
  }
  catch (err) {
    console.log('Error logging session:', err);
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// Retrieve pomodoro session history
router.get('/pomodoro-history', async (req, res) => {
  const userId = req.userId;

  try {
    const client = await pool.connect();

    const dailySessionQuery = `
      SELECT
        DATE(completed_at) AS date,
        SUM(duration_minutes) AS minutes
      FROM pomodoro_sessions
      WHERE user_id = $1
      GROUP BY DATE(completed_at)
      ORDER BY date
      LIMIT 30
    `;

    const weeklySessionQuery = `
      SELECT
        DATE_TRUNC('week', completed_at)::date AS week_start,
        SUM(duration_minutes) AS minutes
      FROM pomodoro_sessions
      WHERE user_id = $1
      GROUP BY week_start
      ORDER BY week_start
      LIMIT 12
    `;

    const monthlySessionQuery = `
      SELECT 
        TO_CHAR(completed_at, 'YYYY-MM') AS month,
        SUM(duration_minutes) AS minutes
      FROM pomodoro_sessions
      WHERE user_id = $1
      GROUP BY month
      ORDER BY month
      LIMIT 6
    `;

    const [dailySessionResult, weeklySessionResult, monthlySessionResult] = await Promise.all([
      client.query(dailySessionQuery, [userId]),
      client.query(weeklySessionQuery, [userId]),
      client.query(monthlySessionQuery, [userId])
    ]);

    client.release();

    res.json({
      daily: dailySessionResult.rows,
      weekly: weeklySessionResult.rows,
      monthly: monthlySessionResult.rows
    });
  }
  catch (err) {
    console.error('Error fetching pomodoro history:', err);
    res.status(500).json({ error: 'Failed to fetch pomodoro stats' });
  }
});

// Get leaderboard data
router.get('/leaderboards', async (req, res) => {
  try {
    const fetchTotalMinsLeaderboard = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY SUM(ps.duration_minutes) DESC) AS rank,
        u.username,
        SUM(ps.duration_minutes) AS weekly_minutes
      FROM users u
      JOIN pomodoro_sessions ps ON u.id = ps.user_id
      WHERE ps.completed_at >= DATE_TRUNC('week', CURRENT_DATE)
      GROUP BY u.username
      ORDER BY weekly_minutes DESC
      LIMIT 50
    `;

    const result = await pool.query(fetchTotalMinsLeaderboard);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leaderboard data not found' });
    }

    res.json(result.rows);
  }
  catch (err) {
    console.error('Error fetching leaderboard data:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

export default router;
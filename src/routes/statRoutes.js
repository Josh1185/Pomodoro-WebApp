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

function toUTCMidnight(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Update stats for a completed timer PUT /update
router.put('/update', async (req, res) => {
  const { pomodoroTime } = req.body;
  const userId = req.userId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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

    const today = toUTCMidnight(new Date());
    const lastDate = toUTCMidnight(new Date(last_study_date));
    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);
    const todayStr = today.toISOString().slice(0, 10);

    let updateStreak = false;

    if (!last_study_date) {
      newStreak = 1;
      updateStreak = true;
    } else if (lastDate.getTime() === yesterday.getTime()) {
      newStreak += 1;
      updateStreak = true;
    } else if (lastDate.getTime() === today.getTime()) {
      // Same day, streak remains the same
      updateStreak = false;
    } else {
      newStreak = 1;
      updateStreak = true;
    }

    // Update stats query
    if (updateStreak) {
      await client.query(`
      UPDATE user_stats
      SET total_pomodoro_time = total_pomodoro_time + $1,
          total_pomodoros_completed = total_pomodoros_completed + 1,
          last_study_date = $2,
          consecutive_days_streak = $3
      WHERE user_id = $4
    `, [pomodoroTime, todayStr, newStreak, userId]);
    }
    else {
      // Only update total time and completed count, not streak or last_study_date
      await client.query(`
        UPDATE user_stats
        SET total_pomodoro_time = total_pomodoro_time + $1,
            total_pomodoros_completed = total_pomodoros_completed + 1
        WHERE user_id = $2
      `, [pomodoroTime, userId]);
    }

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
        DATE(completed_at AT TIME ZONE 'UTC') AS date,
        SUM(duration_minutes) AS minutes
      FROM pomodoro_sessions
      WHERE user_id = $1
      GROUP BY DATE(completed_at AT TIME ZONE 'UTC')
      ORDER BY date
      LIMIT 30
    `;

    const weeklySessionQuery = `
      SELECT
        DATE_TRUNC('week', completed_at AT TIME ZONE 'UTC')::date AS week_start,
        SUM(duration_minutes) AS minutes
      FROM pomodoro_sessions
      WHERE user_id = $1
      GROUP BY week_start
      ORDER BY week_start
      LIMIT 12
    `;

    const monthlySessionQuery = `
      SELECT 
        TO_CHAR(completed_at AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
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

// Endpoint for fetching username and email GET /stats/credentials
router.get('/credentials', async (req, res) => {
  const userId = req.userId;

  try {
    const fetchUsernameAndEmail = ` 
      SELECT username, email
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(fetchUsernameAndEmail, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Error fetching username and email' });
    }

    res.json(result.rows[0]);
  }
  catch (err) {
    console.error('Error fetching username and email:', err);
    res.status(500).json({ error: 'Error fetching username and email' });
  }
});

// Endpoint to check if streak is expired
router.get('/streak-check', async (req, res) => {
  const userId = req.userId;

  try {
    const { rows } = await pool.query(`
        SELECT last_study_date, consecutive_days_streak
        FROM user_stats
        WHERE user_id = $1
    `, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User stats not found' });
    }

    const { last_study_date, consecutive_days_streak } = rows[0];

    // handle new users or never studied
    if (!last_study_date) {
      return res.json({ message: 'No streak yet' });
    }

    const today = toUTCMidnight(new Date());
    const lastDate = toUTCMidnight(new Date(last_study_date));
    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);
    const todayStr = today.toISOString().slice(0, 10);

    // If the last study date is before yesterday, reset the streak to 0
    if (lastDate < yesterday) {
      await pool.query(`
        UPDATE user_stats
        SET consecutive_days_streak = 0
        WHERE user_id = $1
      `, [userId]);

      return res.json({ message: 'Streak reset to 0 due to inactivity', streak: 0 });
    }

    res.json({ message: 'Streak still valid', streak: consecutive_days_streak });
  }
  catch (err) {
    console.log('Streak check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
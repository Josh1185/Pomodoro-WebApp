import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../dbconfig.js';
// google oath imports
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URI,
  }, async (accessToken, refreshToken, profile, done) => {

    const email = profile.emails[0].value;
    const username = profile.displayName;

    try {
      const existingUser = await pool.query(`  
        SELECT * FROM users 
        WHERE email = $1
      `, [email]);

      let userId;
      if (existingUser.rows.length === 0) {
        // New user - insert with placeholder password
        const hashedPwd = await bcrypt.hash(profile.id, 12);
        const newUser = await pool.query(`
          INSERT INTO users (username, email, password)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [username, email, hashedPwd]);

        userId = newUser.rows[0].id;

        // Insert default settings and stats
        await pool.query(`
          INSERT INTO user_settings (user_id)
          VALUES ($1)
        `, [userId]);

        await pool.query(`
          INSERT INTO user_stats (user_id, total_pomodoro_time, total_pomodoros_completed, total_tasks_completed, last_study_date, consecutive_days_streak)
          VALUES ($1, 0, 0, 0, NULL, 0)
        `, [userId]);
      }
      else {
        userId = existingUser.rows[0].id;
      }

      done(null, { id: userId });
    }
    catch(err) {
      done(err, null);
    }
  }));
}
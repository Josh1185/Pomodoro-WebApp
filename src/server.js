import 'dotenv/config';
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import { pool } from './dbconfig.js';
import authMiddleware from './middleware/authMiddleware.js';
import taskRoutes from './routes/taskRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import statRoutes from './routes/statRoutes.js';
// Google oauth imports
import passport from 'passport';
import './passport/googleStrategy.js';

const app = express();
const PORT = process.env.PORT || 5050;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());

// Init DB on server start
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL, 
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed_pomodoros INTEGER DEFAULT 0,
        estimated_pomodoros INTEGER DEFAULT 1,
        is_current BOOLEAN DEFAULT false,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        pomodoro_duration INTEGER DEFAULT 25,
        short_break_duration INTEGER DEFAULT 5,
        long_break_duration INTEGER DEFAULT 15,
        theme VARCHAR(10) DEFAULT 'light',
        accent_color VARCHAR(20) DEFAULT '#f66262'
      );

      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_pomodoro_time INTEGER DEFAULT 0,
        total_pomodoros_completed INTEGER DEFAULT 0,
        total_tasks_completed INTEGER DEFAULT 0,
        last_study_date DATE DEFAULT NULL,
        consecutive_days_streak INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
        duration_minutes INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
  } catch (err) {
    console.log(err);
  }
}
initDb();

// Tells express to serve home HTML file from the /public directory
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint for '/': Serves up the home html file from the /public directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/google-success', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/googleSuccess.html'));
})

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Initialize passport
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', authMiddleware, taskRoutes);
app.use('/settings', authMiddleware, settingsRoutes);
app.use('/stats', authMiddleware, statRoutes);

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`);
  });
}
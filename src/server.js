import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import { pool } from './dbconfig.js';
import authMiddleware from './middleware/authMiddleware.js';
import taskRoutes from './routes/taskRoutes.js';

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
        username VARCHAR(100) UNIQUE NOT NULL,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('DB successfully initialized');
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

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', authMiddleware, taskRoutes)

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`);
});
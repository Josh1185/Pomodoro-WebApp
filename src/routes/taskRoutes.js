import express from 'express';
import { pool } from '../dbconfig.js';

const router = express.Router();

// Get all of a logged in user's tasks
router.get('/', async (req, res) => {
  try {
    const getTasks = `
      SELECT * FROM tasks
      WHERE user_id = $1
    `;
    const value = [req.userId];
    const result = await pool.query(getTasks, value);
    const taskList = result.rows;
    res.json(taskList);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add a new task to the list
router.post('/', async (req, res) => {
  try {
    const {
      title, 
      description, 
      estimated_pomodoros
    } = req.body;

    const addTask = `
      INSERT INTO tasks (user_id, title, description, estimated_pomodoros)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [req.userId, title, description, estimated_pomodoros];

    const result = await pool.query(addTask, values);
    const taskId = result.rows[0].id;

    res.status(201).json({
      id: taskId,
      user_id: req.userId,
      title,
      description,
      completed_pomodoros: 0,
      estimated_pomodoros,
      is_current: false,
      is_completed: false,
      created_at: new Date().toISOString()
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

export default router;
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

// Edit a task  PUT /edit/:id
router.put('/edit/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      estimated_pomodoros
    } = req.body;
    const taskId = req.params.id;

    const editTask = `
      UPDATE tasks
      SET title = $1,
          description = $2,
          estimated_pomodoros = $3
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;
    const values = [title, description, estimated_pomodoros, taskId, req.userId];
    
    const result = await pool.query(editTask, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found or not authorized" });
    }

    res.json(result.rows[0]); //returns updated task
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete a task DELETE /delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.userId;

    const deleteTask = `
      DELETE FROM tasks
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const values = [taskId, userId];

    const result = await pool.query(deleteTask, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found or not authorized" });
    }

    res.json({ message: "Task deleted successfully" });
  }
  catch (err) {
    console.log("Error deleting task: " + err);
    res.status(500).json({ error: "Inernal server error" });
  }
});

export default router;
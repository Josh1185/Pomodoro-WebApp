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

// Get all of a logged in user's completed tasks
router.get('/completed', async (req, res) => {
  try {
    const getCompletedTasks = `
      SELECT * FROM tasks
      WHERE user_id = $1 and is_completed = true
    `;
    const values = [req.userId];
    const result = await pool.query(getCompletedTasks, values);
    const taskList = result.rows;
    res.json(taskList);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a logged in user's current task
router.get('/current', async (req, res) => {
  try {
    const getCompletedTasks = `
      SELECT * FROM tasks
      WHERE user_id = $1 and is_current = true
    `;
    const values = [req.userId];
    const result = await pool.query(getCompletedTasks, values);
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
    console.log("Error deleting task: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark a task as completed PUT /complete/:id
router.put('/complete/:id', async (req, res) => {
  try {
    const {
      is_completed,
      is_current
    } = req.body;
    const taskId = req.params.id;
    const userId = req.userId;

    const markTaskComplete = `
      UPDATE tasks
      SET is_completed = $1,
          is_current = $2
      WHERE id = $3 and user_id = $4
      RETURNING *
    `;
    const values = [is_completed, is_current, taskId, userId];

    const result = await pool.query(markTaskComplete, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found or not authorized" });
    }

    res.json({ message: "Task marked as complete" });
  }
  catch (err) {
    console.log("Error marking task as complete: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// pin a task as current PUT /current/pin/:id
router.put('/current/pin/:id', async (req, res) => {
  try {
    const { is_current } = req.body;
    const taskId = req.params.id;
    const userId = req.userId;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Unset is_current for all other tasks (ensures that only one task can be pinned)
      await client.query(`
        UPDATE tasks 
        SET is_current = false 
        WHERE user_id = $1
      `, [userId]);

      const pinTaskAsCurrent = `
        UPDATE tasks
        SET is_current = $1
        WHERE id = $2 and user_id = $3
        RETURNING *
      `;
      const values = [is_current, taskId, userId];

      const result = await client.query(pinTaskAsCurrent, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: "Task not found or not authorized" });
      }

      await client.query('COMMIT');
      res.json({ message: "Task successfully pinned" });
    }
    catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
    finally {
      client.release();
    }
  }
  catch (err) {
    console.log("Error pinning task as current: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// unpin a current task PUT /current/unpin/:id
router.put('/current/unpin/:id', async (req, res) => {
  try {
    const { is_current } = req.body;
    const taskId = req.params.id;
    const userId = req.userId;

    const pinTaskAsCurrent = `
      UPDATE tasks
      SET is_current = $1
      WHERE id = $2 and user_id = $3
      RETURNING *
    `;
    const values = [is_current, taskId, userId];

    const result = await pool.query(pinTaskAsCurrent, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found or not authorized" });
    }

    res.json({ message: "Task successfully unpinned" })
  }
  catch (err) {
    console.log("Error unpinning task as current: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
import express from 'express';
import { pool } from '../dbconfig.js';

const router = express.Router();

function sanitize(str) {
  return String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

function validateTask({ title, description, estimated_pomodoros }) {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  } else if (title.length > 100) {
    errors.push("Title must be under 100 characters");
  }

  if (!description || description.trim().length === 0) {
    errors.push("Description is required");
  } else if (description.length > 300) {
    errors.push("Description must be under 300 characters");
  }

  const est = Number(estimated_pomodoros);
  if (!estimated_pomodoros || isNaN(est) || est < 1 || est >= 100 || !Number.isInteger(est)) {
    errors.push("Estimated pomodoros must be a positive integer under 100");
  }

  return errors;
}

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
  
  const {
    title, 
    description, 
    estimated_pomodoros
  } = req.body;

  const errors = validateTask({ title, description, estimated_pomodoros });
  if (errors.length) {
    return res.status(400).json({ error: errors.join(", ") });
  }

  const sanitizedTitle = sanitize(title);
  const sanitizedDescription = sanitize(description);

  try {
    const addTask = `
      INSERT INTO tasks (user_id, title, description, estimated_pomodoros)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [req.userId, sanitizedTitle, sanitizedDescription, estimated_pomodoros];

    const result = await pool.query(addTask, values);
    const taskId = result.rows[0].id;

    res.status(201).json({
      id: taskId,
      user_id: req.userId,
      title: sanitizedTitle,
      description: sanitizedDescription,
      completed_pomodoros: 0,
      estimated_pomodoros,
      is_current: false,
      is_completed: false,
      created_at: new Date().toISOString(),
      completed_at: null
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Update completed pomodoros /pomos/:id (AND STATS)
router.put('/pomos/:id', async (req, res) => {
  try {
    const { completed_pomodoros } = req.body;
    const taskId = req.params.id;
    const userId = req.userId;

    // Update task pomodoros
    const updatePomos = `
      UPDATE tasks
      SET completed_pomodoros = $1
      WHERE id = $2 AND user_id = $3 AND is_current = true
      RETURNING *
    `;
    const values = [completed_pomodoros, taskId, userId];

    const result = await pool.query(updatePomos, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found or not authorized" });
    }

    res.json({ message: "Current task completed_pomodoros updated successfully and stats updated successfully" });
  }
  catch (err) {
    console.log("Error updating current task completed_pomodoros: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Edit a task  PUT /edit/:id
router.put('/edit/:id', async (req, res) => {
  
  const {
    title,
    description,
    estimated_pomodoros
  } = req.body;
  const taskId = req.params.id;

  const errors = validateTask({ title, description, estimated_pomodoros });
  if (errors.length) {
    return res.status(400).json({ error: errors.join(", ") });
  }

  const sanitizedTitle = sanitize(title);
  const sanitizedDescription = sanitize(description);

  try {
    const editTask = `
      UPDATE tasks
      SET title = $1,
          description = $2,
          estimated_pomodoros = $3
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;
    const values = [sanitizedTitle, sanitizedDescription, estimated_pomodoros, taskId, req.userId];
    
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
  let client;
  try {
    const {
      is_completed,
      is_current
    } = req.body;
    const taskId = req.params.id;
    const userId = req.userId;

    client = await pool.connect();
    await client.query('BEGIN');

    // Check if the task is already completed
    const existingTaskResponse = await client.query(`
      SELECT is_completed
      FROM tasks
      WHERE id = $1 AND user_id = $2
      `, [taskId, userId]
    );

    if (existingTaskResponse.rowCount === 0) {
      if (client) await client.query('ROLLBACK');
      return res.status(404).json({ error: "Task not found or not authorized" });
    }

    const alreadyCompleted = existingTaskResponse.rows[0].is_completed;

    const markTaskComplete = `
      UPDATE tasks
      SET is_completed = $1,
          is_current = $2,
          completed_at = NOW()
      WHERE id = $3 and user_id = $4
      RETURNING *
    `;
    const values = [is_completed, is_current, taskId, userId];
    const result = await client.query(markTaskComplete, values);

    // If the task is newly completed, increment total_tasks_completed
    if (!alreadyCompleted && is_completed === true) {
      await client.query(`
        UPDATE user_stats
        SET total_tasks_completed = total_tasks_completed + 1
        WHERE user_id = $1
        `, [userId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: "Task marked as complete" });
  }
  catch (err) {
    if (client) await client.query('ROLLBACK');
    console.log("Error marking task as complete: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
  finally {
    if (client) client.release();
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

// clear all tasks
router.delete('/', async (req, res) => {
  try {
    const userId = req.userId;

    const clearTasks = `
      DELETE FROM tasks
      WHERE user_id = $1 AND is_completed = false
      RETURNING *
    `;
    const values = [userId];

    const result = await pool.query(clearTasks, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No tasks found or not authorized" });
    }

    res.json({ message: "Task list cleared successfully" });
  }
  catch (err) {
    console.log("Error clearing task list: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
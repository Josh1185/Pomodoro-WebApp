import { expect } from "chai";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/server.js";
import { pool } from "../src/dbconfig.js";

describe('Test Suite: Protected Task Routes', () => {
  // Declare token, task id, and user id variables
  let token;
  let testUserId;
  let testTaskId;

  // Clean up db table and insert a test user to retrieve id and token
  beforeEach(async () => {
    // Clean up user, stats, and tasks
    await pool.query(`
      DELETE FROM users
      WHERE username = $1
    `, ['tasktestuser']);

    await pool.query(`
      DELETE FROM tasks
      WHERE title IN ($1, $2)
    `, ['tasktest', 'tasktest2']);

    await pool.query(`
      DELETE FROM user_stats
      WHERE total_pomodoro_time = $1
    `, [0]);

    // Insert user
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['tasktestuser', 'tasktestuser@example.com', 'test_1234']);

    // Retrieve user id
    testUserId = userResult.rows[0].id;

    // Generate JWT token for test user
    token = jwt.sign({ id: testUserId}, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Insert task
    const taskResult = await pool.query(`
      INSERT INTO tasks (user_id, title, description, estimated_pomodoros)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [testUserId, 'tasktest', 'desc', 3]);

    // Insert default user_stats
    await pool.query(`
      INSERT INTO user_stats (
        user_id, 
        total_pomodoro_time, 
        total_pomodoros_completed, 
        total_tasks_completed, 
        last_study_date, 
        consecutive_days_streak
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [testUserId, 0, 0, 0, null, 0]);

    // Retrieve task id
    testTaskId = taskResult.rows[0].id;
  });

  // Test Task Fetch
  it('GET /tasks => should fetch tasks for authenticated user', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', token);
    
    // Expect a status code of 200
    expect(res.statusCode).to.equal(200);
    // Check that the response body is an array
    expect(res.body).to.be.an('array');

    // Check that the returned task matches inserted task
    expect(res.body.length).to.be.greaterThan(0);
    expect(res.body[0]).to.include({
      title: 'tasktest',
      description: 'desc',
      estimated_pomodoros: 3,
      user_id: testUserId
    });
  });

  // Test Adding a Task
  it('POST /tasks => should insert a new task', async () => {
    // Task insert payload
    const payload = {
      "title": "testtask2",
      "description": "desc2",
      "estimated_pomodoros": 5,
    };

    const res = await request(app)
      .post('/tasks')
      .set('Authorization', token)
      .send(payload);

    // Expect status code 201
    expect(res.statusCode).to.equal(201);

    // Check that the response is an object
    expect(res.body).to.be.an('object');

    // Check that the returned task matches the inserted
    expect(res.body).to.include({
      title: 'testtask2',
      description: 'desc2',
      estimated_pomodoros: 5,
      user_id: testUserId
    });
  });

  // Test editing a Task
  it ('PUT /tasks/edit/:id => should edit the task at specified id', async () => {
    // Task Edit Payload
    const payload = {
      "title": "testtask",
      "description": "EDITED desc",
      "estimated_pomodoros": 4,
    };

    // Edit testtask using testTaskId
    const res = await request(app)
      .put(`/tasks/edit/${testTaskId}`)
      .set('Authorization', token)
      .send(payload);

    // Expect status code 200
    expect(res.statusCode).to.equal(200);

    // Check that the response is an object
    expect(res.body).to.be.an('object');

    // Check the edited task has testTaskId and its new values
    expect(res.body).to.include({
      title: 'testtask',
      description: 'EDITED desc',
      estimated_pomodoros: 4,
      user_id: testUserId,
      id: testTaskId
    });
  });

  // Test deleting a task
  it(`DELETE /tasks/delete/:id => should delete the task at specified id`, async () => {

    // Delete testtask using testTaskId from the req params
    const res = await request(app)
      .delete(`/tasks/delete/${testTaskId}`)
      .set('Authorization', token);

    // Expect status code 200
    expect(res.statusCode).to.equal(200);

    // Expect api to return msg
    expect(res.body).to.have.property('message').that.includes('Task deleted successfully');

    // Expect task with testTaskId to be gone
    const searchResult = await pool.query(`
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2
    `, [testTaskId, testUserId]);
    expect(searchResult.rowCount).to.equal(0);
  });

  // Test marking a task complete
  it(`PUT /tasks/complete/:id => should mark a task complete at specified id and update user_stats tasks completed`, async () => {
    // Payload
    const payload = {
      "is_completed": true,
      "is_current": false
    };

    // Mark testtask complete using testTaskId from the req params
    const res = await request(app)
      .put(`/tasks/complete/${testTaskId}`)
      .set('Authorization', token)
      .send(payload);

    // Expect status code 200
    expect(res.statusCode).to.equal(200);

    // Expect api to return msg
    expect(res.body).to.have.property('message').that.includes('Task marked as complete');

    // Expect task with testTaskId to be marked as completed and not marked as current
    const searchResult = await pool.query(`
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2
    `, [testTaskId, testUserId]);
    expect(searchResult.rows[0].is_completed).to.equal(true);
    expect(searchResult.rows[0].is_current).to.equal(false);

    // Expect user_stats (total_tasks_completed) to be incremented by 1
    const statsResult = await pool.query(`
      SELECT * FROM user_stats
      WHERE user_id = $1
    `, [testUserId]);
    expect(statsResult.rows[0].total_tasks_completed).to.equal(1);

  });

  // Test pinning a task as current
  it('PUT /tasks/current/pin/:id => should pin a task as current at specified id', async () => {

    // Mark an additional task as current
    const testTask2Result = await pool.query(`
      INSERT INTO tasks (user_id, title, description, estimated_pomodoros, is_current)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [testUserId, 'testtask2', 'desc2', 8, true]);
    const testTask2Id = testTask2Result.rows[0].id;

    // Payload
    const payload = { "is_current": true };

    // Mark testtask as current task using testTaskId from req params
    const res = await request(app)
      .put(`/tasks/current/pin/${testTaskId}`)
      .set('Authorization', token)
      .send(payload);
    
    // Expect status code 200
    expect(res.statusCode).to.equal(200);

    // Expect api to return msg
    expect(res.body).to.have.property('message').that.includes('Task successfully pinned');

    // Expect testtask to be pinned as current (true), and testtask2 to be unpinned (false)
    const task1Result = await pool.query(`
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2
    `, [testTaskId, testUserId]);
    const task2Result = await pool.query(`
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2
    `, [testTask2Id, testUserId]);

    expect(task1Result.rows[0].is_current).to.equal(true);
    expect(task2Result.rows[0].is_current).to.equal(false);

  });

  // Test unpinning a current task
  it ('PUT /tasks/current/unpin/:id => should unpin the current task', async () => {
    // Pin testtask as current
    await pool.query(`
      UPDATE tasks
      SET is_current = $1
      WHERE id = $2 AND user_id = $3
    `, [true, testTaskId, testUserId]);

    // Payload
    const payload = { "is_current": false };

    // unpin testtask
    const res = await request(app)
      .put(`/tasks/current/unpin/${testTaskId}`)
      .set('Authorization', token)
      .send(payload);

    // Expect status code 200
    expect(res.statusCode).to.equal(200);

    // Expect api to return msg
    expect(res.body).to.have.property('message').that.includes('Task successfully unpinned');

    // Expect testtask to be unpinned (is_current = false)
    const result = await pool.query(`
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2
    `, [testTaskId, testUserId]);

    expect(result.rows[0].is_current).to.equal(false);
  });

  // Test clearing the task list
  it('DELETE /tasks => should clear the task list', async () => {

    // Add two additional tasks
    const task2Result = await pool.query(`
      INSERT INTO tasks (user_id, title, description, estimated_pomodoros)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [testUserId, 'testtask2', 'desc', 9]);
    const task3Result = await pool.query(`
      INSERT INTO tasks (user_id, title, description, estimated_pomodoros)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [testUserId, 'testtask3', 'desc', 7]);
    const testTask2Id = task2Result.rows[0].id;
    const testTask3Id = task3Result.rows[0].id;

    // Check that there are 3 tasks in the list before clearing
    const beforeClearing = await pool.query(`
      SELECT * FROM tasks
      WHERE user_id = $1
    `, [testUserId]);
    expect(beforeClearing.rowCount).to.equal(3);

    // Make request to clear task list
    const res = await request(app)
      .delete('/tasks')
      .set('Authorization', token);

    // Expect status code 200
    expect(res.statusCode).to.equal(200);

    // Expect api to return msg
    expect(res.body).to.have.property('message').that.includes('Task list cleared successfully');

    // Check that there are 0 tasks in the list after clearing
    const afterClearing = await pool.query(`
      SELECT * FROM tasks
      WHERE user_id = $1
    `, [testUserId]);
    expect(afterClearing.rowCount).to.equal(0);

  });

  // Test completing a pomodoro on a task
  it(`PUT /tasks/pomos/:id => should increment the current task's completed pomodoros`, async () => {
    // Payload
    const payload = { "completed_pomodoros": 1 };

    // First check that testtask has 0 completed_pomodoros
    const beforePomo = await pool.query(`
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2
    `, [testTaskId, testUserId]);
    expect(beforePomo.rows[0].completed_pomodoros).to.equal(0);

    // Set testtask to be pinned as current first (endpoint only works that way)
    await pool.query(`
      UPDATE tasks
      SET is_current = $1
      WHERE id = $2 AND user_id = $3
    `, [true, testTaskId, testUserId]);

    // Make request to complete a pomodoro
    const res = await request(app)
      .put(`/tasks/pomos/${testTaskId}`)
      .set('Authorization', token)
      .send(payload);
    
    // Expect status code 200
    expect(res.statusCode).to.equal(200);

    // Expect api to return msg
    expect(res.body).to.have.property('message').that.includes('Current task completed_pomodoros updated successfully');

    // First check that testtask has 1 completed_pomodoros
    const afterPomo = await pool.query(`
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2
    `, [testTaskId, testUserId]);
    expect(afterPomo.rows[0].completed_pomodoros).to.equal(1);

  });

  // Cleanup test db after test suite
  after(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM user_settings');
    await pool.query('DELETE FROM user_stats');
  });
});
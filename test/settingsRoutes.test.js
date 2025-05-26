import { expect } from "chai";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/server.js";
import { pool } from "../src/dbconfig.js";

describe('Test Suite: Protected Settings Routes', () => {
  // Declare Token and UserId variables
  let token;
  let testUserId;

  // Clean up db table and insert a test user to retrieve id and token
  beforeEach(async () => {
    // Clean up user and settings
    await pool.query(`
      DELETE FROM users
      WHERE username = $1
    `, ['settingstestuser']);

    await pool.query(`
      DELETE FROM user_settings
      WHERE accent_color = $1
    `, ['#f66262']);

    // Insert user
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['settingstestuser', 'settingstestuser@example.com', 'test_1234']);

    // Retrieve user id
    testUserId = userResult.rows[0].id;

    // Generate JWT token for test user
    token = jwt.sign({ id: testUserId}, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Insert default settings for settingstestuser
    await pool.query(`
      INSERT INTO user_settings (user_id)
      VALUES ($1)
    `, [testUserId]);
  });

  // Test Settings Retrieval
  it('GET /settings => should retrieve all settings for the user', async () => {
    
    // Make request using authorization token
    const res = await request(app)
      .get('/settings')
      .set('Authorization', token);

    // Expect status code of 200
    expect(res.statusCode).to.equal(200);
    // Check that the response body returns an object
    expect(res.body).to.be.an('object');

    // Check that the returned settings are default
    expect(res.body).to.include({
      user_id: testUserId,
      pomodoro_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      theme: 'light',
      accent_color: '#f66262',
    });

  });

  // Test Settings Update
  it('PUT /settings => should update settings for the user', async () => {
    // Payload
    const payload = {
      "pomodoro_duration": 45,
      "short_break_duration": 10,
      "long_break_duration": 30,
      "theme": "dark",
      "accent_color": "#f66262",
    };

    // Make request with payload
    const res = await request(app)
      .put('/settings')
      .set('Authorization', token)
      .send(payload);

    // Expect a status code of 200
    expect(res.statusCode).to.equal(200);

    // Make a get request to retrieve settings and expect values from the payload
    const res2 = await request(app)
      .get('/settings')
      .set('Authorization', token);

    // Expect status code of 200
    expect(res2.statusCode).to.equal(200);
    // Check that the response body returns an object
    expect(res2.body).to.be.an('object');

    // Check that the returned settings are default
    expect(res2.body).to.include({
      user_id: testUserId,
      pomodoro_duration: 45,
      short_break_duration: 10,
      long_break_duration: 30,
      theme: 'dark',
      accent_color: '#f66262',
    });

  });

  // Cleanup test db after test suite
  after(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM user_settings');
  });
});
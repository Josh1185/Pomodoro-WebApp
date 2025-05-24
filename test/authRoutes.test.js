import { expect } from 'chai';
import request from 'supertest';
import app from '../src/server.js';
import { pool } from '../src/dbconfig.js';
import bcrypt from 'bcryptjs';

describe('Test Suite: Signup Route => POST /auth/signup', () => {

  beforeEach(async () => {
    // Delete all users before each test
    await pool.query(`
      DELETE FROM users 
      WHERE username IN ($1, $2, $3) OR email IN ($4, $5, $6)
      `, ['testuser', 'dummyuser', 'testuser2','testuser@example.com', 'dummyuser@dummy.com', 'testuser2@example.com']
    );

    // insert a dummy user so that a duplicate email entry returns 409
    await pool.query(`
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
      `, ['dummyuser', 'dummyuser@dummy.com', 'dummy_1234']
    );
  });
  
  // Test with valid credentials
  it('w/ valid credentials should return 201', async () => {
    // Valid credential payload
    const payload = { 
      "username": "testuser",
      "email": "testuser@example.com",
      "password": "test_1234",
    }

    const res = await request(app)
      .post('/auth/signup')
      .send(payload);
    
    expect(res.statusCode).to.equal(201);
  });

  // Test with duplicate credentials (email = 'dummyuser@dummy.com')
  it('w/ duplicate credentials should return 409', async () => {
    // Duplicate credential payload
    const payload = { 
      "username": "dummyuser",
      "email": "dummyuser@dummy.com",
      "password": "dummy_1234",
    }

    const res = await request(app)
      .post('/auth/signup')
      .send(payload);
    
    expect(res.statusCode).to.equal(409);
  });

  // Test with invalid credentials (email = 'hello')
  it ('w/ invalid credentials should return 400', async () => {
    // Invalid credential payload
    const payload = {
      "username": "hello",
      "email": "hello",
      "password": "hello",
    }

    const res = await request(app)
      .post('/auth/signup')
      .send(payload);
    
    expect(res.statusCode).to.equal(400);
  });

  // Test that defualt settings and stats are applied upon successful sign up
  it('upon successful sign up, default stats and settings are created', async () => {
    // Valid credential payload
    const payload = {
      "username": "testuser2",
      "email": "testuser2@example.com",
      "password": "test_1234",
    }

    // Signup user w/ that payload
    const res = await request(app)
      .post('/auth/signup')
      .send(payload);
    
    // Expect a return of 201
    expect(res.statusCode).to.equal(201);

    // Get user id
    const userResult = await pool.query(`
      SELECT id FROM users
      WHERE email = $1
    `, [payload.email]);
    const userId = userResult.rows[0].id;

    // Check for default settings
    const settingsResult = await pool.query(`
      SELECT * FROM user_settings
      WHERE user_id = $1
    `, [userId]);
    expect(settingsResult.rows.length).to.equal(1);

    // Check for default stats
    const statsResult = await pool.query(`
      SELECT * FROM user_stats
      WHERE user_id = $1 
    `, [userId]);
    expect(statsResult.rows.length).to.equal(1);
    expect(statsResult.rows[0].total_pomodoro_time).to.equal(0);
    expect(statsResult.rows[0].consecutive_days_streak).to.equal(0);
  });

  // Cleanup test db after test suite
  after(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM user_settings');
    await pool.query('DELETE FROM user_stats');
  });

});

describe('Test Suite: Login Route => POST /auth/login', () => {

  beforeEach(async () => {
    // Delete dummy user before each test
    await pool.query(`
      DELETE FROM users 
      WHERE username = $1 OR email = $2
      `, ['dummyuser', 'dummyuser@dummy.com']
    );

    // Create a hased password for dummyuser
    const hashedPwd = await bcrypt.hash('dummy_1234', 10);
    // Re insert a dummy user so that logging in with valid credentials passes
    await pool.query(`
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
      `, ['dummyuser', 'dummyuser@dummy.com', hashedPwd]
    );
  });

  // Test with valid credentials
  it('w/ valid credentials should return 202', async () => {
    // Valid credential payload
    const payload = { 
      "email": "dummyuser@dummy.com",
      "password": "dummy_1234",
    }

    const res = await request(app)
      .post('/auth/login')
      .send(payload);
    
    expect(res.statusCode).to.equal(202);
  });

  // Test with non existent email
  it('w/ non existent email should return 404', async () => {
    // Non existent credential payload
    const payload = {
      "email": "fakeuser@fake.com",
      "password": "fake_1234",
    }

    const res = await request(app)
      .post('/auth/login')
      .send(payload);

    expect(res.statusCode).to.equal(404);
  });

  // Test with invalid password
  it('w/ invalid password should return 401', async () => {
    // invalid password payload
    const payload = {
      "email": "dummyuser@dummy.com",
      "password": "invalid_pwd1234",
    }

    const res = await request(app)
      .post('/auth/login')
      .send(payload);

    expect(res.statusCode).to.equal(401);
  });

  // Cleanup test db after test suite
  after(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM user_settings');
    await pool.query('DELETE FROM user_stats');
  });
});
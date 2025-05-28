import { expect } from "chai";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/server.js";
import { pool } from "../src/dbconfig.js";

describe('Test Suite: Protected Stat Routes', () => {
  // Declare Token and UserId variables
  let token;
  let testUserId;

  beforeEach(async () => {
    // Clean up users, pomodoro_sessions and user_stats tables 
    await pool.query(`
      DELETE FROM users
    `);

    await pool.query(`
      DELETE FROM user_stats
    `);

    await pool.query(`
      DELETE FROM pomodoro_sessions
    `);

    // Insert user
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['statstestuser', 'statstestuser@example.com', 'test_1234']);

    // Retrieve user id
    testUserId = userResult.rows[0].id;

    // Generate JWT token for test user
    token = jwt.sign({ id: testUserId}, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Insert default stats for statstestuser
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
  });

  // Test stats retrieval
  it('GET /stats => should return all stats for the user', async () => {
    // Make request with authorization
    const res = await request(app)
      .get('/stats')
      .set('Authorization', token);

    // Expect status code 200
    expect(res.statusCode).to.equal(200);
    // Expect res body to be an object
    expect(res.body).to.be.an('object');

    // Check that the returned stats are default
    expect(res.body).to.deep.equal({
      username: {
        username: 'statstestuser',
      },
      stats: {
        user_id: testUserId,
        total_pomodoro_time: 0,
        total_pomodoros_completed: 0,
        total_tasks_completed: 0,
        last_study_date: null,
        consecutive_days_streak: 0,
      },
    });
  });

  // Test stats update
  it(`PUT /stats/update => should update the user's stats`, async () => {
    // Payload of pomodoro time (since this endpoint is reached when timer goes off)
    const payload = { "pomodoroTime": 1500 };

    // Send put request
    const res = await request(app)
      .put(`/stats/update`)
      .set('Authorization', token)
      .send(payload);

    // Expect status 200
    expect(res.statusCode).to.equal(200);
    // Expect res message
    expect(res.body).to.have.property('message').that.includes('User stats updated successfully');

    // Retrieve user stats and expect the following:
    const statRes = await request(app)
      .get('/stats')
      .set('Authorization', token);

    // Used to get todays date with UTC time
    function toUTCMidnight(date) {
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }

    expect(statRes.statusCode).to.equal(200);
    expect(statRes.body).to.be.an('object');

    // Get the last study date
    const today = toUTCMidnight(new Date());
    const todayStr = today.toISOString().slice(0, 10);

    expect(statRes.body).to.deep.include({
      username: {
        username: 'statstestuser',
      },
      stats: {
        user_id: testUserId,
        last_study_date: `${todayStr}T04:00:00.000Z`,
        total_pomodoro_time: 1500,
        total_pomodoros_completed: 1,
        total_tasks_completed: 0,
        consecutive_days_streak: 1,
      },
    });

    // Now that there is a new streak, test the endpoint again and check that the streak remains as 1
    const payload2 = { "pomodoroTime": 1500 };

    // Send put request
    const res2 = await request(app)
      .put(`/stats/update`)
      .set('Authorization', token)
      .send(payload2);

    // Expect status 200
    expect(res2.statusCode).to.equal(200);
    // Expect res message
    expect(res2.body).to.have.property('message').that.includes('User stats updated successfully');

    // Retrieve user stats and expect the following:
    const statRes2 = await request(app)
      .get('/stats')
      .set('Authorization', token);

    expect(statRes2.statusCode).to.equal(200);
    expect(statRes2.body).to.be.an('object');

    expect(statRes2.body).to.deep.include({
      username: {
        username: 'statstestuser',
      },
      stats: {
        user_id: testUserId,
        last_study_date: `${todayStr}T04:00:00.000Z`,
        total_pomodoro_time: 3000,
        total_pomodoros_completed: 2,
        total_tasks_completed: 0,
        consecutive_days_streak: 1,
      },
    });
  });

  // Test logging and retrieving pomodoro sessions
  it(`POST /stats/log-session => should log a new pomodoro session | GET /stats/pomodoro-history => should retrieve pomodoro sessions`, async () => {
    // Payload for session 1
    const payload1 = {
      "duration_minutes": 25,
      "task_id": null,
    };

    // Make request to log session
    const logRes1 = await request(app)
      .post('/stats/log-session')
      .set('Authorization', token)
      .send(payload1);

    // Expect status 201
    expect(logRes1.statusCode).to.equal(201);
    // Expect res message
    expect(logRes1.body).to.have.property('message').that.includes('Session logged successfully');

    // Payload for session 2
    const payload2 = {
      "duration_minutes": 15,
      "task_id": null,
    };

    // Make request to log session
    const logRes2 = await request(app)
      .post('/stats/log-session')
      .set('Authorization', token)
      .send(payload2);

    // Expect status 201
    expect(logRes2.statusCode).to.equal(201);
    // Expect res message
    expect(logRes2.body).to.have.property('message').that.includes('Session logged successfully');

    // Retrieve Pomodoro Session History
    const getRes = await request(app)
      .get('/stats/pomodoro-history')
      .set('Authorization', token);
    
    // Expect status 200
    expect(getRes.statusCode).to.equal(200);
    // Expect res body to be an object
    expect(getRes.body).to.be.an('object');

    // Check that the response has the correct structure
    expect(getRes.body).to.have.property('daily').that.is.an('array');
    expect(getRes.body).to.have.property('weekly').that.is.an('array');
    expect(getRes.body).to.have.property('monthly').that.is.an('array');

    const actualDate = getRes.body.daily[0].date;
    const actualWeekStart = getRes.body.weekly[0].week_start;
    const actualMonth = getRes.body.monthly[0].month;

    // Assertions
    expect(getRes.body.daily).to.deep.include({
      date: actualDate,
      minutes: '40'
    });
    expect(getRes.body.weekly).to.deep.include({
      week_start: actualWeekStart,
      minutes: '40'
    });
    expect(getRes.body.monthly).to.deep.include({
      month: actualMonth,
      minutes: '40'
    });
  });

  // Test retrieval of leaderboard data
  it(`GET /stats/leaderboards => should fetch leaderboard data`, async () => {
    // Add an additional user
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['statstestuser2', 'statstestuser2@example.com', 'test_1234']);
    // Retrieve id
    const testUser2Id = userResult.rows[0].id;
    // Generate JWT token for test user 2
    const token2 = jwt.sign({ id: testUser2Id}, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Log pomodoro sessions for both users
    // Session payload for user 1
    const sessionPayload1 = {
      "duration_minutes": 45,
      "task_id": null,
    };

    // Make request to log session
    const logRes1 = await request(app)
      .post('/stats/log-session')
      .set('Authorization', token)
      .send(sessionPayload1);

    // Expect status 201
    expect(logRes1.statusCode).to.equal(201);
    // Expect res message
    expect(logRes1.body).to.have.property('message').that.includes('Session logged successfully');

    // Session payload for user 2
    const sessionPayload2 = {
      "duration_minutes": 35,
      "task_id": null,
    };

    // Make request to log session
    const logRes2 = await request(app)
      .post('/stats/log-session')
      .set('Authorization', token2)
      .send(sessionPayload2);

    // Expect status 201
    expect(logRes2.statusCode).to.equal(201);
    // Expect res message
    expect(logRes2.body).to.have.property('message').that.includes('Session logged successfully');

    // Now test retrieval of leaderboard data
    const getRes = await request(app)
      .get('/stats/leaderboards')
      .set('Authorization', token);

    // Expect status 200
    expect(getRes.statusCode).to.equal(200);
    // Expect res body to be an array
    expect(getRes.body).to.be.an('array');
    /*
      [
        { rank: '1', username: 'statstestuser', weekly_minutes: '45' },
        { rank: '2', username: 'statstestuser2', weekly_minutes: '35' }
      ]
    */

    // Assertions
    expect(getRes.body[0]).to.deep.include({
      rank: '1',
      username: 'statstestuser',
      weekly_minutes: '45',
    });

    expect(getRes.body[1]).to.deep.include({
      rank: '2',
      username: 'statstestuser2',
      weekly_minutes: '35',
    });
    
  });

  // Test streak check
  it(`GET /stats/streak-check => should check for a streak`, async () => {
    // 1. try checking for a streak when test user doesn't have one
    const noStreakRes = await request(app)
      .get('/stats/streak-check')
      .set('Authorization', token);
    
    expect(noStreakRes.statusCode).to.equal(200);
    expect(noStreakRes.body).to.have.property('message').that.includes('No streak yet');

    // 2. try checking for valid streak
    // First update user's stats to add create a streak
    const updatePayload = { "pomodoroTime": 1500 };

    // Send put request
    const updateRes = await request(app)
      .put(`/stats/update`)
      .set('Authorization', token)
      .send(updatePayload);

    // Expect status 200
    expect(updateRes.statusCode).to.equal(200);
    // Expect res message
    expect(updateRes.body).to.have.property('message').that.includes('User stats updated successfully');

    const validStreakRes = await request(app)
      .get('/stats/streak-check')
      .set('Authorization', token);
    
    expect(validStreakRes.statusCode).to.equal(200);

    expect(validStreakRes.body).to.deep.include({
      message: 'Streak still valid',
      streak: 1,
    });

    // 3. try checking for an expired streak
    // first retrieve the last_study_date for the user by using the get /stats endpoint
    const getStatsRes = await request(app)
      .get('/stats')
      .set('Authorization', token);

    // Expect status code 200
    expect(getStatsRes.statusCode).to.equal(200);
    // Expect res body to be an object
    expect(getStatsRes.body).to.be.an('object');

    // Retrieve last study date and set it 2 days behind to lose the streak
    const lastStudyDate = getStatsRes.body.stats.last_study_date;
    const twoDaysBefore = new Date(lastStudyDate);
    twoDaysBefore.setUTCDate(twoDaysBefore.getUTCDate() - 2);

    // Update the last_study_date in the user_stats table
    await pool.query(`
      UPDATE user_stats
      SET last_study_date = $1
      WHERE user_id = $2
    `, [twoDaysBefore, testUserId]);

    // Now check if the streak is reset
    const expiredStreakRes = await request(app)
      .get('/stats/streak-check')
      .set('Authorization', token);

    // Expect status 200
    expect(expiredStreakRes.statusCode).to.equal(200);

    expect(expiredStreakRes.body).to.deep.include({
      message: 'Streak reset to 0 due to inactivity',
      streak: 0,
    });

  });

  // Cleanup test db after test suite
  after(async () => {
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM user_stats');
    await pool.query('DELETE FROM pomodoro_sessions');
  });
});
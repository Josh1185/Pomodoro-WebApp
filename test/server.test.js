import { expect } from 'chai';
import request from 'supertest';
import app from '../src/server.js';

describe('Test Suite: Server Endpoints', () => {

  it('GET / => should return 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).to.equal(200);
  });

  it('GET /login => should return 200', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).to.equal(200);
  });

  it('GET /signup => should return 200', async () => {
    const res = await request(app).get('/signup');
    expect(res.statusCode).to.equal(200);
  });

  it('GET /dashboard => should return 200', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).to.equal(200);
  });

});

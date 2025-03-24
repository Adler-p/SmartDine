import request from 'supertest';
import { app } from '../../app';
import { UserRole } from '../../models/user';

it('returns a 201 on successful signup', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: UserRole.CUSTOMER
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'invalid-email',
      password: 'password',
      name: 'Test User',
      role: UserRole.CUSTOMER
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'p',
      name: 'Test User',
      role: UserRole.CUSTOMER
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({})
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: UserRole.CUSTOMER
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User 2',
      role: UserRole.CUSTOMER
    })
    .expect(400);
});

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: UserRole.CUSTOMER
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});

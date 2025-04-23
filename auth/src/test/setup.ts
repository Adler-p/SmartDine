import { AppDataSource } from '../config/typeorm.config';
import { UserRole } from '../models/user';

declare global {
  var signin: () => Promise<string[]>;
}

beforeAll(async () => {
  process.env.JWT_KEY = 'test-key';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  process.env.POSTGRES_HOST = 'localhost';
  process.env.POSTGRES_PORT = '5432';
  process.env.POSTGRES_USER = 'postgres';
  process.env.POSTGRES_PASSWORD = 'postgres';
  process.env.POSTGRES_DB = 'auth_test';

  await AppDataSource.initialize();
  await AppDataSource.synchronize(true);
});

afterAll(async () => {
  await AppDataSource.destroy();
});

global.signin = async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: UserRole.CUSTOMER
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');
  if (!cookie) {
    throw new Error('Failed to get cookie from response');
  }

  return cookie;
};

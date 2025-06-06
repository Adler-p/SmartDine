import { DataSource } from 'typeorm';
import { User } from '../models/user';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'auth',
  synchronize: true, // Set to false in production
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],
}); 
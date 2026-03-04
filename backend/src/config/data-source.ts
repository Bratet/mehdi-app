import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'gamecenter',
  password: process.env.POSTGRES_PASSWORD ?? 'gamecenterpass',
  database: process.env.POSTGRES_DB ?? 'gamecenterdb',
  entities: ['src/modules/**/entities/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

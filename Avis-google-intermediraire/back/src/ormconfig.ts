import { DataSource } from 'typeorm';
import { Rdv } from '../src/rdv/rdv.entity';
import { Vote } from '../src/vote/vote.entity';
import * as dotenv from 'dotenv';
dotenv.config();


export const AppDataSource = process.env.NODE_ENV === 'production' ? new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Rdv, Vote],
  synchronize: true,
  ssl: { rejectUnauthorized: false },
})
: new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || '',
  entities: [Rdv, Vote],
  synchronize: true
});

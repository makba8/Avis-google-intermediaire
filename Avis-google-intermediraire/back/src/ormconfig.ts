import { DataSource } from 'typeorm';
import { Rdv } from '../src/rdv/rdv.entity';
import { Vote } from '../src/vote/vote.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './data/db.sqlite',
  entities: [Rdv, Vote],
  synchronize: true
});

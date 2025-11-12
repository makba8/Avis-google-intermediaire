import { DataSource } from 'typeorm';
import { Rdv } from '../src/rdv/rdv.entity';
import { Vote } from '../src/vote/vote.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource =
  process.env.NODE_ENV === 'production'
    ? null // on ne crée pas de DataSource TypeORM en production
    : new DataSource({
        type: 'sqlite',
        database: process.env.DATABASE_PATH || 'dev.sqlite',
        entities: [Rdv, Vote],
        synchronize: true,
      });

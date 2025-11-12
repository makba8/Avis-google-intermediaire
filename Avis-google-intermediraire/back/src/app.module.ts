import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { RdvModule } from './rdv/rdv.module';
import { VoteModule } from './vote/vote.module';
import { MailModule } from './mail/mail.module';
import { GoogleModule } from './google/google.module';
import { CronModule } from './cron/cron.module';
import { StatsController } from './stats/stats.controller';
import { Rdv } from './rdv/rdv.entity';
import { Vote } from './vote/vote.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'Ressources'),
      serveRoot: '/static', 
    }),
    TypeOrmModule.forRoot(
      process.env.SUPABASE_URL || (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL)
        ? {
            // Configuration Supabase/PostgreSQL pour la production
            type: 'postgres',
            url: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
            entities: [Rdv, Vote],
            synchronize: true,
            logging: process.env.NODE_ENV === 'development',
            // Supabase nécessite SSL
            ssl: process.env.SUPABASE_URL ? { rejectUnauthorized: false } : (process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false),
          }
        : {
            // Configuration SQLite pour le développement local
            type: 'sqlite',
            database: process.env.DATABASE_PATH || '/app/data/avis.sqlite',
            entities: [Rdv, Vote],
            synchronize: true,
            logging: process.env.NODE_ENV === 'development',
          }
    ),
    RdvModule,
    VoteModule,
    MailModule,
    GoogleModule,
    CronModule,
  ],
  controllers: [StatsController],
})
export class AppModule {}

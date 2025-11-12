import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { Rdv } from '../rdv/rdv.entity';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { SupabaseModule } from '../supabase/supabase.module';

// TypeORM uniquement en développement (si Supabase n'est pas configuré)
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

@Module({
  imports: [
    ...(useSupabase ? [] : [TypeOrmModule.forFeature([Vote, Rdv])]),
    SupabaseModule,
  ],
  providers: [VoteService],
  controllers: [VoteController],
  exports: [VoteService],
})
export class VoteModule {}




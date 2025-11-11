import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { Rdv } from '../rdv/rdv.entity';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Rdv])],
  providers: [VoteService],
  controllers: [VoteController],
  exports: [VoteService],
})
export class VoteModule {}




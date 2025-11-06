import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { Rdv } from '../rdv/rdv.entity';
import { Repository, DataSource } from 'typeorm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    @InjectRepository(Rdv) private rdvRepo: Repository<Rdv>,
    private dataSource: DataSource,
    private mailService: MailService
  ) {}

  async createVote(token: string, note: number, commentaire?: string) {
    if (note < 1 || note > 5) throw new BadRequestException('note must be between 1 and 5');

    // transaction pour éviter doublons
    return this.dataSource.transaction(async manager => {
      const rdv = await manager.findOne(Rdv, { where: { token } });
      if (!rdv) throw new BadRequestException('Invalid token');

      const existing = await manager.findOne(Vote, { where: { token } });
      if (existing) throw new ConflictException('Vote already exists for this token');

      const vote = manager.create(Vote, {
        token,
        note,
        commentaire: commentaire || null,
        dateVote: new Date()
      });
      await manager.save(vote);

      // si note < 4 : notifier le podologue
      if (note < 4) {
        await this.mailService.sendInternalBadReview(process.env.MAIL_FROM ?? '', note, commentaire);
      }

      return { vote, redirect: note >= 4 ? process.env.GOOGLE_REVIEW_URL : null };
    });
  }
}

import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { Rdv } from '../rdv/rdv.entity';
import { Repository, DataSource } from 'typeorm';
import { Constants } from '../Ressources/Constants';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    @InjectRepository(Rdv) private rdvRepo: Repository<Rdv>,
    private dataSource: DataSource
  ) {}

  async createVote(token: string, note: number, commentaire?: string) {
    if (!Constants.isValidRating(note)) {
      throw new BadRequestException(Constants.ERROR_INVALID_RATING);
    }

    // transaction pour éviter doublons
    return this.dataSource.transaction(async manager => {
      const rdv = await manager.findOne(Rdv, { where: { token } });
      if (!rdv) throw new BadRequestException(Constants.ERROR_INVALID_TOKEN);

      const existing = await manager.findOne(Vote, { where: { token } });
      if (existing) throw new ConflictException(Constants.ERROR_VOTE_ALREADY_EXISTS);

      const vote = manager.create(Vote, {
        token,
        note,
        commentaire: commentaire || null,
        dateVote: new Date()
      });
      await manager.save(vote);

      // Note: L'email au podologue pour les mauvaises notes est géré côté frontend via EmailJS
      // Le backend enregistre simplement le vote dans la base de données

      return { 
        vote, 
        redirect: Constants.isPositiveRating(note) ? Constants.getGoogleReviewUrl() : null 
      };
    });
  }

  async validateToken(token: string) {
    if (!token) {
      return { valid: false, alreadyVoted: false };
    }

    const rdv = await this.rdvRepo.findOne({ where: { token } });
    if (!rdv) {
      return { valid: false, alreadyVoted: false };
    }

    const existingVote = await this.voteRepo.findOne({ where: { token } });
    return { valid: true, alreadyVoted: !!existingVote };
  }

  async getStats() {
    const totalRdv = await this.rdvRepo.count();
    const totalVotes = await this.voteRepo.count();
    
    const votes = await this.voteRepo.find();
    const averageRating = votes.length > 0 
      ? votes.reduce((sum, v) => sum + v.note, 0) / votes.length 
      : 0;
    const badVotes = votes.filter(v => !Constants.isPositiveRating(v.note)).length;

    return {
      totalRdv,
      totalVotes,
      averageRating: Math.round(averageRating * 10) / 10,
      badVotes
    };
  }
}

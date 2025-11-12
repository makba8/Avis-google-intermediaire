import { Injectable, ConflictException, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { Rdv } from '../rdv/rdv.entity';
import { Repository, DataSource } from 'typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { Constants } from '../Ressources/Constants';

@Injectable()
export class VoteService {
  private useSupabase: boolean;

  constructor(
    @Optional() @InjectRepository(Vote) private voteRepo: Repository<Vote> | null,
    @Optional() @InjectRepository(Rdv) private rdvRepo: Repository<Rdv> | null,
    @Optional() private dataSource: DataSource | null,
    private supabaseService: SupabaseService
  ) {
    // Vérifier si Supabase est configuré (via variables d'env ou service)
    this.useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) || this.supabaseService.isEnabled();
  }

  async createVote(token: string, note: number, commentaire?: string) {
    if (!Constants.isValidRating(note)) {
      throw new BadRequestException(Constants.ERROR_INVALID_RATING);
    }

    if (this.useSupabase) {
      // Vérifier que le token existe et qu'il n'y a pas déjà de vote
      const rdv = await this.supabaseService.findRdvByToken(token);
      if (!rdv) throw new BadRequestException(Constants.ERROR_INVALID_TOKEN);

      const existing = await this.supabaseService.findVoteByToken(token);
      if (existing) throw new ConflictException(Constants.ERROR_VOTE_ALREADY_EXISTS);

      const vote = await this.supabaseService.createVote({
        token,
        note,
        commentaire: commentaire || null,
        dateVote: new Date()
      });

      return { 
        vote, 
        redirect: Constants.isPositiveRating(note) ? Constants.getGoogleReviewUrl() : null 
      };
    } else {
      // Transaction pour éviter doublons (SQLite)
      if (!this.dataSource) throw new Error('DataSource non initialisé');
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

        return { 
          vote, 
          redirect: Constants.isPositiveRating(note) ? Constants.getGoogleReviewUrl() : null 
        };
      });
    }
  }

  async validateToken(token: string) {
    if (!token) {
      return { valid: false, alreadyVoted: false };
    }

    if (this.useSupabase) {
      const rdv = await this.supabaseService.findRdvByToken(token);
      if (!rdv) {
        return { valid: false, alreadyVoted: false };
      }
      const existingVote = await this.supabaseService.findVoteByToken(token);
      return { valid: true, alreadyVoted: !!existingVote };
    } else {
      if (!this.rdvRepo || !this.voteRepo) throw new Error('Repositories non initialisés');
      const rdv = await this.rdvRepo.findOne({ where: { token } });
      if (!rdv) {
        return { valid: false, alreadyVoted: false };
      }
      const existingVote = await this.voteRepo.findOne({ where: { token } });
      return { valid: true, alreadyVoted: !!existingVote };
    }
  }

  async getStats() {
    if (this.useSupabase) {
      const totalRdv = await this.supabaseService.countRdv();
      const totalVotes = await this.supabaseService.countVotes();
      const votes = await this.supabaseService.getAllVotes();
      
      const averageRating = votes.length > 0 
        ? votes.reduce((sum: number, v: any) => sum + v.note, 0) / votes.length 
        : 0;
      const badVotes = votes.filter((v: any) => !Constants.isPositiveRating(v.note)).length;

      return {
        totalRdv,
        totalVotes,
        averageRating: Math.round(averageRating * 10) / 10,
        badVotes
      };
    } else {
      if (!this.rdvRepo || !this.voteRepo) throw new Error('Repositories non initialisés');
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
}

import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from '../common/dtos/create-vote.dto';
import { Constants } from '../Ressources/Constants';

@Controller(Constants.API_PREFIX + '/vote')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post()
  async vote(@Body() body: CreateVoteDto) {
    const res = await this.voteService.createVote(body.token, body.note, body.commentaire);
    if (res.redirect) return { redirectUrl: res.redirect };
    return { ok: true };
  }

  @Get('validate')
  async validate(@Query('token') token: string) {
    return this.voteService.validateToken(token);
  }
}

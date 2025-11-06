import { Controller, Post, Body } from '@nestjs/common';
import { VoteService } from './vote.service';

@Controller('api/vote')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post()
  async vote(@Body() body: { token: string; note: number; commentaire?: string }) {
    const res = await this.voteService.createVote(body.token, body.note, body.commentaire);
    if (res.redirect) return { redirectUrl: res.redirect };
    return { ok: true };
  }
}

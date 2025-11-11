import { Controller, Get } from '@nestjs/common';
import { VoteService } from '../vote/vote.service';
import { Constants } from '../Ressources/Constants';

@Controller(Constants.API_PREFIX + '/stats')
export class StatsController {
  constructor(private voteService: VoteService) {}

  @Get()
  async getStats() {
    return this.voteService.getStats();
  }
}




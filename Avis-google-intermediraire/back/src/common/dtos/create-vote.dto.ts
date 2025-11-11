import { IsString, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';
import { Constants } from '../../Ressources/Constants';

export class CreateVoteDto {
  @IsString()
  token: string;

  @IsInt()
  @Min(Constants.MIN_RATING)
  @Max(Constants.MAX_RATING)
  note: number;

  @IsOptional()
  @IsString()
  @MaxLength(Constants.MAX_COMMENT_LENGTH)
  commentaire?: string;
}




import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class UpsertDailyLogDto {
  @IsInt() waterMl!: number;
  @IsNumber() sleepHours!: number;
  @IsInt() steps!: number;
  @IsInt() @Min(1) @Max(10) mood!: number;
  @IsString() date!: string;
}

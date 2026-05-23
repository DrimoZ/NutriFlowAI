import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min, MaxLength, ArrayMaxSize } from 'class-validator';

export class ChatDto {
  @IsString() @MaxLength(1000) message!: string;
  @IsOptional() @IsString() @MaxLength(80) conversationId?: string;
}

export class GeneratePlanDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(14) days!: number;
  @Type(() => Number) @IsNumber() @Min(1200) @Max(5000) calories!: number;
  @Type(() => Number) @IsNumber() @Min(40) @Max(350) proteinG!: number;
  @Type(() => Number) @IsNumber() @Min(50) @Max(600) carbsG!: number;
  @Type(() => Number) @IsNumber() @Min(20) @Max(220) fatsG!: number;
  @IsArray() @ArrayMaxSize(20) allergies!: string[];
  @IsArray() @ArrayMaxSize(30) dislikedFoods!: string[];
  @IsString() @MaxLength(40) dietType!: string;
  @Type(() => Number) @IsNumber() @Min(20) @Max(2000) weeklyBudget!: number;
}

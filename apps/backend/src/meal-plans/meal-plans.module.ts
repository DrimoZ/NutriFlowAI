import { Module } from '@nestjs/common';
import { MealPlansController } from './meal-plans.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
@Module({ controllers: [MealPlansController], providers: [PrismaService, AiService] })
export class MealPlansModule {}

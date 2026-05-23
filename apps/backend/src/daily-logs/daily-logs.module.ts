import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DailyLogsController } from './daily-logs.controller';
import { DailyLogsService } from './daily-logs.service';

@Module({ controllers: [DailyLogsController], providers: [DailyLogsService, PrismaService] })
export class DailyLogsModule {}

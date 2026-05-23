import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertDailyLogDto } from './dto';

@Injectable()
export class DailyLogsService {
  constructor(private prisma: PrismaService) {}
  async upsert(userId: string, dto: UpsertDailyLogDto) {
    const existing = await this.prisma.dailyLog.findFirst({ where: { userId, date: dto.date } });
    if (existing) return this.prisma.dailyLog.update({ where: { id: existing.id }, data: dto });
    return this.prisma.dailyLog.create({ data: { userId, ...dto } });
  }
  list(userId: string) { return this.prisma.dailyLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 14 }); }
}

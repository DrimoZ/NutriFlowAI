import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { DailyLogsService } from './daily-logs.service';
import { UpsertDailyLogDto } from './dto';

@Controller('daily-logs')
@UseGuards(JwtGuard)
export class DailyLogsController {
  constructor(private logs: DailyLogsService) {}
  @Get() list(@Req() req: { user: { sub: string } }) { return this.logs.list(req.user.sub); }
  @Post() upsert(@Req() req: { user: { sub: string } }, @Body() body: UpsertDailyLogDto) { return this.logs.upsert(req.user.sub, body); }
}

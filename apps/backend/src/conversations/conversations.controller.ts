import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
@Controller('conversations')
@UseGuards(JwtGuard)
export class ConversationsController { @Get() list() { return { items: [] }; } }

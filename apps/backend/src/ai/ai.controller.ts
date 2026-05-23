import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from '../auth/jwt.guard';
import { AiService } from './ai.service';
import { ChatDto, GeneratePlanDto } from './dto';

@Controller('ai')
@UseGuards(JwtGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Post('chat')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  chat(@Req() req: { user: { sub: string } }, @Body() body: ChatDto) {
    return this.ai.chat(req.user.sub, body.message, body.conversationId);
  }

  @Post('generate-plan')
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  generate(@Body() body: GeneratePlanDto) {
    return this.ai.generatePlan(body);
  }

  @Get('nutrition-preview')
  nutritionPreview() {
    return this.ai.sampleNutrition();
  }
}

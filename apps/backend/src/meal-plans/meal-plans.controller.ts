import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratePlanDto } from '../ai/dto';

@Controller('meal-plans')
@UseGuards(JwtGuard)
export class MealPlansController {
  constructor(private ai: AiService, private prisma: PrismaService) {}
  @Get() list(@Req() req: { user: { sub: string } }) { return this.prisma.mealPlan.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: 'desc' } }); }
  @Post('generate')
  async generate(@Req() req: { user: { sub: string } }, @Body() body: GeneratePlanDto) {
    const generated = await this.ai.generatePlan(body);
    const saved = await this.prisma.mealPlan.create({ data: { userId: req.user.sub, title: generated.title ?? 'Generated Plan', days: generated.days ?? [] } });
    await this.prisma.groceryList.create({ data: { userId: req.user.sub, sections: generated.grocerySections ?? {} } });
    return { saved, generated };
  }
}

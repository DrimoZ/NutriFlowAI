import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { calculateNutrition } from '../nutrition/engine';
import { GeneratePlanDto } from './dto';
import { JSON_MEAL_PLAN_PROMPT, NUTRIFLOW_SYSTEM_PROMPT } from './prompts';
import { activityMap, onboardingFlow, OnboardingField } from './onboarding';

@Injectable()
export class AiService {
  private client: OpenAI | null = null;
  constructor(private prisma: PrismaService) {}

  private parseInput(field: OnboardingField, text: string): string {
    if (field === 'allergies') return text.trim() || 'none';
    return text.trim().toLowerCase();
  }

  private nextQuestion(profile: Record<string, string>) {
    const next = onboardingFlow.find((f) => !profile[f.field]);
    return next?.question;
  }

  private getClient(): OpenAI {
    if (this.client) return this.client;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured. Add it to apps/backend/.env or the repository root .env.');
    }

    this.client = new OpenAI({ apiKey });
    return this.client;
  }

  async chat(userId: string, message: string, conversationId?: string) {
    const conversation = conversationId
      ? await this.prisma.conversation.findFirst({ where: { id: conversationId, userId }, include: { messages: { orderBy: { createdAt: 'desc' }, take: 10 } } })
      : await this.prisma.conversation.create({ data: { userId }, include: { messages: true } });

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { nutritionProfile: true, preference: true } });
    const meta = (conversation?.meta as Record<string, string> | null) ?? {};

    const lastAssistant = conversation?.messages.find((m: any) => m.role === 'assistant')?.content ?? '';
    const expected = onboardingFlow.find((x) => lastAssistant.includes(x.question));
    if (expected) meta[expected.field] = this.parseInput(expected.field, message);

    const immediateQuestion = this.nextQuestion(meta);
    let reply = immediateQuestion;

    if (!reply) {
      const activityMultiplier = activityMap[meta.activityLevel ?? 'moderate'] ?? 1.55;
      const nutrition = calculateNutrition({
        sex: (meta.sex === 'female' ? 'female' : 'male'),
        age: Number(meta.age || user?.nutritionProfile?.age || 30),
        heightCm: Number(meta.heightCm || user?.nutritionProfile?.heightCm || 175),
        weightKg: Number(meta.weightKg || user?.nutritionProfile?.weightKg || 75),
        activityMultiplier,
        goal: meta.goal === 'cut' || meta.goal === 'bulk' ? meta.goal : 'maintain'
      });
      await this.prisma.nutritionProfile.upsert({
        where: { userId },
        update: { age: Number(meta.age), sex: meta.sex ?? 'male', heightCm: Number(meta.heightCm), weightKg: Number(meta.weightKg), activityLevel: meta.activityLevel ?? 'moderate', goal: meta.goal ?? 'maintain', ...nutrition },
        create: { userId, age: Number(meta.age), sex: meta.sex ?? 'male', heightCm: Number(meta.heightCm), weightKg: Number(meta.weightKg), activityLevel: meta.activityLevel ?? 'moderate', goal: meta.goal ?? 'maintain', ...nutrition }
      });
      await this.prisma.preference.upsert({
        where: { userId },
        update: { allergies: meta.allergies ? meta.allergies.split(',').map((s) => s.trim()).filter(Boolean).join(', ') : '', restrictions: meta.dietType ?? '', budget: Number(meta.weeklyBudget || 120), cookingSkill: 'intermediate', equipment: '' },
        create: { userId, allergies: meta.allergies ? meta.allergies.split(',').map((s) => s.trim()).filter(Boolean).join(', ') : '', restrictions: meta.dietType ?? '', budget: Number(meta.weeklyBudget || 120), cookingSkill: 'intermediate', equipment: '' }
      });
      reply = `Awesome — profile complete. Targets: **${nutrition.calories} kcal**, **P ${nutrition.proteinG}g / C ${nutrition.carbsG}g / F ${nutrition.fatsG}g**. Want a 3-day or 7-day meal plan first?`;
    }

    if (message.toLowerCase().includes('meal plan') || message.toLowerCase().includes('7-day') || message.toLowerCase().includes('3-day')) {
      const contextMessages = (conversation?.messages ?? []).slice().reverse().map((m: any) => ({ role: m.role as 'user' | 'assistant', content: String(m.content).slice(0, 800) }));
      const completion = await this.getClient().chat.completions.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [{ role: 'system', content: NUTRIFLOW_SYSTEM_PROMPT }, ...contextMessages, { role: 'user', content: message }],
        temperature: 0.5,
        max_tokens: 450
      });
      reply = completion.choices[0]?.message?.content ?? reply;
    }

    await this.prisma.conversation.update({ where: { id: conversation!.id }, data: { meta } });
    await this.prisma.message.createMany({ data: [{ conversationId: conversation!.id, role: 'user', content: message }, { conversationId: conversation!.id, role: 'assistant', content: reply! }] });
    return { conversationId: conversation!.id, reply };
  }

  async generatePlan(dto: GeneratePlanDto) {
    const userPrompt = `Generate a ${dto.days}-day plan at ${dto.calories} kcal/day with macros P:${dto.proteinG} C:${dto.carbsG} F:${dto.fatsG}. Diet: ${dto.dietType}. Allergies: ${dto.allergies.join(', ') || 'none'}. Avoid: ${dto.dislikedFoods.join(', ') || 'none'}. Weekly budget: $${dto.weeklyBudget}.`;
    const completion = await this.getClient().chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: JSON_MEAL_PLAN_PROMPT }, { role: 'user', content: userPrompt }],
      temperature: 0.3,
      max_tokens: 1800
    });
    return JSON.parse(completion.choices[0]?.message?.content ?? '{}');
  }

  sampleNutrition() {
    return calculateNutrition({ sex: 'male', age: 30, heightCm: 178, weightKg: 80, activityMultiplier: 1.55, goal: 'maintain' });
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { GroceryListsModule } from './grocery-lists/grocery-lists.module';
import { ConversationsModule } from './conversations/conversations.module';
import { DailyLogsModule } from './daily-logs/daily-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    AiModule,
    MealPlansModule,
    GroceryListsModule,
    ConversationsModule,
    DailyLogsModule
  ],
  providers: [PrismaService, { provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}

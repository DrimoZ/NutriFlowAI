import { Module } from '@nestjs/common';
import { GroceryListsController } from './grocery-lists.controller';
@Module({ controllers: [GroceryListsController] })
export class GroceryListsModule {}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
@Controller('grocery-lists')
@UseGuards(JwtGuard)
export class GroceryListsController {
  @Get() list() { return { sections: { Produce: ['Spinach', 'Berries'], Pantry: ['Oats', 'Olive oil'] } }; }
}

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private users: UsersService) {}
  @Get('me') me(@Req() req: { user: { sub: string } }) { return this.users.me(req.user.sub); }
}

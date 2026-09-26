import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('line-login')
  lineLogin(@Body() profile: { lineId: string; displayName: string; pictureUrl?: string }) {
    return this.usersService.lineLogin(profile);
  }

  @Get(':id/orders')
  getUserOrders(@Param('id') id: string) {
    return this.usersService.getUserOrders(id);
  }
}

import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Prisma } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: Prisma.OrderCreateInput) {
    return this.ordersService.create(createOrderDto);
  }

  // demo endpoint removed

  @Get('tenant/:tenantId')
  findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.ordersService.findAllByTenant(tenantId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  async create(data: Prisma.OrderCreateInput) {
    const order = await this.prisma.order.create({
      data,
      include: { items: true },
    });

    // 推播給所屬店家的 POS (Room: tenant_ID)
    this.eventsGateway.server.to(	enant_$).emit('newOrder', order);

    return order;
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status }
    });

    // 狀態更新也推播 (讓前台消費者或後台 POS 都能收到更新)
    this.eventsGateway.server.to(	enant_$).emit('orderStatusUpdated', order);

    return order;
  }
}

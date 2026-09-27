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
    
    // Find or create active shift
    const tenantId = (data as any).tenantId || (data.tenant?.connect as any)?.id;
    let shift = await this.prisma.shift.findFirst({
      where: { tenantId, endTime: null },
      orderBy: { startTime: 'desc' }
    });
    if (!shift) {
      shift = await this.prisma.shift.create({
        data: { tenant: { connect: { id: tenantId } } }
      });
    }
    data.shift = { connect: { id: shift.id } };

    const order = await this.prisma.order.create({
      data,
      // 確保回傳時包含明細，以及明細關聯的商品資料 (給 POS 顯示名稱用)
      include: { items: { include: { product: { include: { recipeItems: true } } } } },
    });

    // 扣除庫存 (BOM 邏輯)
    for (const item of order.items) {
      if (item.product.recipeItems && item.product.recipeItems.length > 0) {
        for (const recipe of item.product.recipeItems) {
          const totalDeduction = Number(recipe.amount) * item.quantity;
          await this.prisma.rawMaterial.update({
            where: { id: recipe.rawMaterialId },
            data: { stock: { decrement: totalDeduction } }
          });
        }
      }
    }
    this.eventsGateway.server.to(`tenant_${order.tenantId}`).emit('newOrder', order);
    return order;
  }

  // No mocks allowed. demoCreate removed.

  async findAllByTenant(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status }
    });
    this.eventsGateway.server.to(`tenant_${order.tenantId}`).emit('orderStatusUpdated', order);
    return order;
  }
}

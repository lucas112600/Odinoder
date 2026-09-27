import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string }) {
    return this.prisma.tenant.create({
      data: {
        name: data.name,
        subscriptionPlan: 'FREE'
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  
  async closeShift(tenantId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { tenantId, endTime: null },
      orderBy: { startTime: 'desc' }
    });

    if (!shift) {
      throw new Error('No active shift found');
    }

    const orders = await this.prisma.order.findMany({
      where: { shiftId: shift.id, status: 'COMPLETED' }
    });

    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    return this.prisma.shift.update({
      where: { id: shift.id },
      data: {
        endTime: new Date(),
        totalAmount
      }
    });
  }

  async getActiveShiftTotal(tenantId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { tenantId, endTime: null },
      orderBy: { startTime: 'desc' }
    });

    if (!shift) return { total: 0, orderCount: 0 };

    const orders = await this.prisma.order.findMany({
      where: { shiftId: shift.id, status: 'COMPLETED' }
    });

    const total = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    return { total, orderCount: orders.length, startTime: shift.startTime };
  }

  async update(id: string, data: { name?: string, isActive?: boolean, tables?: string[] }) {
    return this.prisma.tenant.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    // 為了避免 Foreign Key Constraint，依序刪除關聯資料
    await this.prisma.orderItem.deleteMany({
      where: { order: { tenantId: id } }
    });
    await this.prisma.order.deleteMany({
      where: { tenantId: id }
    });
    await this.prisma.product.deleteMany({
      where: { tenantId: id }
    });
    return this.prisma.tenant.delete({
      where: { id }
    });
  }
}

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

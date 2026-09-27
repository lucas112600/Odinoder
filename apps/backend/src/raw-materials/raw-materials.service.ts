
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RawMaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.rawMaterial.create({
      data: {
        name: data.name,
        stock: data.stock,
        unit: data.unit,
        safetyStock: data.safetyStock,
        barcode: data.barcode || null,
        tenantId: data.tenantId,
      }
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.rawMaterial.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.rawMaterial.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    // Delete related recipe items first if any
    await this.prisma.recipeItem.deleteMany({
      where: { rawMaterialId: id }
    });
    return this.prisma.rawMaterial.delete({
      where: { id }
    });
  }
}

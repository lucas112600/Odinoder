import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput & { tenantId: string }) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        category: data.category as string,
        imageUrl: data.imageUrl,
        tenant: {
          connect: { id: data.tenantId }
        }
      }
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {
      name: data.name,
      price: data.price,
      category: data.category as string,
      imageUrl: data.imageUrl,
    };
    
    if (data.recipes) {
      updateData.recipeItems = {
        deleteMany: {},
        create: data.recipes.map((r: any) => ({
          rawMaterialId: r.rawMaterialId,
          amount: r.amount
        }))
      };
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { recipeItems: { include: { rawMaterial: true } } }
    });
  }
}

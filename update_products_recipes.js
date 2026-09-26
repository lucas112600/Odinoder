const fs = require('fs');

let c = fs.readFileSync('apps/backend/src/products/products.service.ts', 'utf8');

c = c.replace(
  /orderBy: \{ createdAt: 'desc' \} \n    \}\);/,
  `orderBy: { createdAt: 'desc' },
      include: { recipeItems: { include: { rawMaterial: true } } }
    });`
);

c = c.replace(
  /async update\(id: string, data: Partial<Prisma\.ProductUpdateInput>\) \{[\s\S]*?\}\);\n  \}/,
  `async update(id: string, data: any) {
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
  }`
);

fs.writeFileSync('apps/backend/src/products/products.service.ts', c);
console.log('Products API updated for real recipes');

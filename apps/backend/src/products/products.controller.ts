import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: any) {
    return this.productsService.create(createProductDto);
  }

  @Get('tenant/:tenantId')
  findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.productsService.findAllByTenant(tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.productsService.update(id, updateData);
  }
}

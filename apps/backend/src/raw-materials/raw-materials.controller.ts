
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';

@Controller('raw-materials')
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}

  @Post()
  create(@Body() data: any) {
    return this.rawMaterialsService.create(data);
  }

  @Get('tenant/:tenantId')
  findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.rawMaterialsService.findAllByTenant(tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.rawMaterialsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rawMaterialsService.remove(id);
  }
}

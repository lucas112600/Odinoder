import { Controller, Get, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  create(@Body() data: { name: string }) {
    return this.tenantsService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  
  @Post(':id/close-shift')
  closeShift(@Param('id') id: string) {
    return this.tenantsService.closeShift(id);
  }

  @Get(':id/active-shift')
  getActiveShiftTotal(@Param('id') id: string) {
    return this.tenantsService.getActiveShiftTotal(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string, isActive?: boolean, tables?: string[], presetTags?: string[] }) {
    return this.tenantsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}

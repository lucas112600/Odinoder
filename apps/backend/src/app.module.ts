import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule,
    RawMaterialsModule } from './tenants/tenants.module';
import { RawMaterialsModule } from './raw-materials/raw-materials.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PrismaModule, EventsModule, TenantsModule, ProductsModule, UsersModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

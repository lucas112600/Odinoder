import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
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

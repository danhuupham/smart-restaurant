
import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [PrismaModule, OrdersModule],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule { }

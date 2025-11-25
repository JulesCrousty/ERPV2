import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SdCustomer } from './entities/sd-customer.entity';
import { SdSalesOrder } from './entities/sd-sales-order.entity';
import { SdSalesOrderItem } from './entities/sd-sales-order-item.entity';
import { SdCustomersService } from './services/sd-customers.service';
import { SdSalesOrdersService } from './services/sd-sales-orders.service';
import { SdCustomersController } from './controllers/sd-customers.controller';
import { SdSalesOrdersController } from './controllers/sd-sales-orders.controller';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SdCustomer, SdSalesOrder, SdSalesOrderItem, Company, User])],
  providers: [SdCustomersService, SdSalesOrdersService],
  controllers: [SdCustomersController, SdSalesOrdersController],
})
export class SdModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PpWorkCenter } from './entities/pp-work-center.entity';
import { PpRouting } from './entities/pp-routing.entity';
import { PpRoutingOperation } from './entities/pp-routing-operation.entity';
import { PpBom } from './entities/pp-bom.entity';
import { PpBomItem } from './entities/pp-bom-item.entity';
import { PpProductionOrder } from './entities/pp-production-order.entity';
import { PpProductionOrderOperation } from './entities/pp-production-order-operation.entity';
import { PpMaterialConsumption } from './entities/pp-material-consumption.entity';
import { PpFinishedGoodsReceipt } from './entities/pp-finished-goods-receipt.entity';
import { MmMaterial } from '../mm/entities/mm-material.entity';
import { MmStock } from '../mm/entities/mm-stock.entity';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';
import { PpWorkCentersService } from './services/pp-work-centers.service';
import { PpRoutingsService } from './services/pp-routings.service';
import { PpBomsService } from './services/pp-boms.service';
import { PpProductionOrdersService } from './services/pp-production-orders.service';
import { PpWorkCentersController } from './controllers/pp-work-centers.controller';
import { PpRoutingsController } from './controllers/pp-routings.controller';
import { PpBomsController } from './controllers/pp-boms.controller';
import { PpProductionOrdersController } from './controllers/pp-production-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PpWorkCenter,
      PpRouting,
      PpRoutingOperation,
      PpBom,
      PpBomItem,
      PpProductionOrder,
      PpProductionOrderOperation,
      PpMaterialConsumption,
      PpFinishedGoodsReceipt,
      MmMaterial,
      MmStock,
      Company,
      User,
    ]),
  ],
  providers: [PpWorkCentersService, PpRoutingsService, PpBomsService, PpProductionOrdersService],
  controllers: [PpWorkCentersController, PpRoutingsController, PpBomsController, PpProductionOrdersController],
})
export class PpModule {}

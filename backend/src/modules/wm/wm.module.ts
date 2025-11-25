import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WmWarehouse } from './entities/wm-warehouse.entity';
import { WmStorageType } from './entities/wm-storage-type.entity';
import { WmStorageBin } from './entities/wm-storage-bin.entity';
import { WmBinStock } from './entities/wm-bin-stock.entity';
import { WmTransportOrder } from './entities/wm-transport-order.entity';
import { WmWarehouseTask } from './entities/wm-warehouse-task.entity';
import { WmWarehousesController } from './controllers/wm-warehouses.controller';
import { WmWarehousesService } from './services/wm-warehouses.service';
import { WmStorageTypesController } from './controllers/wm-storage-types.controller';
import { WmStorageTypesService } from './services/wm-storage-types.service';
import { WmStorageBinsController } from './controllers/wm-storage-bins.controller';
import { WmStorageBinsService } from './services/wm-storage-bins.service';
import { WmBinMovementsController } from './controllers/wm-bin-movements.controller';
import { WmBinMovementsService } from './services/wm-bin-movements.service';
import { WmTransportOrdersController } from './controllers/wm-transport-orders.controller';
import { WmTransportOrdersService } from './services/wm-transport-orders.service';
import { WmWarehouseTasksController } from './controllers/wm-warehouse-tasks.controller';
import { WmWarehouseTasksService } from './services/wm-warehouse-tasks.service';
import { MmMaterial } from '../mm/entities/mm-material.entity';
import { MmStock } from '../mm/entities/mm-stock.entity';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WmWarehouse,
      WmStorageType,
      WmStorageBin,
      WmBinStock,
      WmTransportOrder,
      WmWarehouseTask,
      MmMaterial,
      MmStock,
      Company,
      User,
    ]),
  ],
  controllers: [
    WmWarehousesController,
    WmStorageTypesController,
    WmStorageBinsController,
    WmBinMovementsController,
    WmTransportOrdersController,
    WmWarehouseTasksController,
  ],
  providers: [
    WmWarehousesService,
    WmStorageTypesService,
    WmStorageBinsService,
    WmBinMovementsService,
    WmTransportOrdersService,
    WmWarehouseTasksService,
  ],
})
export class WmModule {}

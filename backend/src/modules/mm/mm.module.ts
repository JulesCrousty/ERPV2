import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MmMaterial } from './entities/mm-material.entity';
import { MmVendor } from './entities/mm-vendor.entity';
import { MmPurchaseRequisition } from './entities/mm-purchase-requisition.entity';
import { MmPurchaseRequisitionItem } from './entities/mm-purchase-requisition-item.entity';
import { MmPurchaseOrder } from './entities/mm-purchase-order.entity';
import { MmPurchaseOrderItem } from './entities/mm-purchase-order-item.entity';
import { MmGoodsReceipt } from './entities/mm-goods-receipt.entity';
import { MmGoodsReceiptItem } from './entities/mm-goods-receipt-item.entity';
import { MmStock } from './entities/mm-stock.entity';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';
import { MmMaterialsService } from './services/mm-materials.service';
import { MmVendorsService } from './services/mm-vendors.service';
import { MmPurchaseRequisitionsService } from './services/mm-purchase-requisitions.service';
import { MmPurchaseOrdersService } from './services/mm-purchase-orders.service';
import { MmGoodsReceiptsService } from './services/mm-goods-receipts.service';
import { MmStockService } from './services/mm-stock.service';
import { MmMaterialsController } from './controllers/mm-materials.controller';
import { MmVendorsController } from './controllers/mm-vendors.controller';
import { MmPurchaseRequisitionsController } from './controllers/mm-purchase-requisitions.controller';
import { MmPurchaseOrdersController } from './controllers/mm-purchase-orders.controller';
import { MmGoodsReceiptsController } from './controllers/mm-goods-receipts.controller';
import { MmStockController } from './controllers/mm-stock.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MmMaterial,
      MmVendor,
      MmPurchaseRequisition,
      MmPurchaseRequisitionItem,
      MmPurchaseOrder,
      MmPurchaseOrderItem,
      MmGoodsReceipt,
      MmGoodsReceiptItem,
      MmStock,
      Company,
      User,
    ]),
  ],
  providers: [
    MmMaterialsService,
    MmVendorsService,
    MmPurchaseRequisitionsService,
    MmPurchaseOrdersService,
    MmGoodsReceiptsService,
    MmStockService,
  ],
  controllers: [
    MmMaterialsController,
    MmVendorsController,
    MmPurchaseRequisitionsController,
    MmPurchaseOrdersController,
    MmGoodsReceiptsController,
    MmStockController,
  ],
  exports: [MmStockService],
})
export class MmModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QmInspectionLot } from './entities/qm-inspection-lot.entity';
import { QmCharacteristic } from './entities/qm-characteristic.entity';
import { QmInspectionResult } from './entities/qm-inspection-result.entity';
import { QmUsageDecision } from './entities/qm-usage-decision.entity';
import { QmQualityLevel } from './entities/qm-quality-level.entity';
import { Company } from '../core/entities/company.entity';
import { MmMaterial } from '../mm/entities/mm-material.entity';
import { User } from '../auth/entities/user.entity';
import { QmInspectionLotsService } from './services/qm-inspection-lots.service';
import { QmCharacteristicsService } from './services/qm-characteristics.service';
import { QmInspectionResultsService } from './services/qm-inspection-results.service';
import { QmUsageDecisionsService } from './services/qm-usage-decisions.service';
import { QmQualityLevelsService } from './services/qm-quality-levels.service';
import { QmInspectionLotsController } from './controllers/qm-inspection-lots.controller';
import { QmCharacteristicsController } from './controllers/qm-characteristics.controller';
import { QmInspectionResultsController } from './controllers/qm-inspection-results.controller';
import { QmUsageDecisionsController } from './controllers/qm-usage-decisions.controller';
import { QmQualityLevelsController } from './controllers/qm-quality-levels.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QmInspectionLot,
      QmCharacteristic,
      QmInspectionResult,
      QmUsageDecision,
      QmQualityLevel,
      Company,
      MmMaterial,
      User,
    ]),
  ],
  providers: [
    QmInspectionLotsService,
    QmCharacteristicsService,
    QmInspectionResultsService,
    QmUsageDecisionsService,
    QmQualityLevelsService,
  ],
  controllers: [
    QmInspectionLotsController,
    QmCharacteristicsController,
    QmInspectionResultsController,
    QmUsageDecisionsController,
    QmQualityLevelsController,
  ],
})
export class QmModule {}

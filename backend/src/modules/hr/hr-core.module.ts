import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrDepartment } from './entities/hr-department.entity';
import { HrPosition } from './entities/hr-position.entity';
import { HrEmployee } from './entities/hr-employee.entity';
import { HrContract } from './entities/hr-contract.entity';
import { HrSkill } from './entities/hr-skill.entity';
import { HrEmployeeSkill } from './entities/hr-employee-skill.entity';
import { HrTraining } from './entities/hr-training.entity';
import { HrEmployeeTraining } from './entities/hr-employee-training.entity';
import { HrJobHistory } from './entities/hr-job-history.entity';
import { HrAbsence } from './entities/hr-absence.entity';
import { HrEmployeeDocument } from './entities/hr-employee-document.entity';
import { HrDepartmentsService } from './services/hr-departments.service';
import { HrPositionsService } from './services/hr-positions.service';
import { HrEmployeesService } from './services/hr-employees.service';
import { HrContractsService } from './services/hr-contracts.service';
import { HrSkillsService } from './services/hr-skills.service';
import { HrTrainingsService } from './services/hr-trainings.service';
import { HrJobHistoryService } from './services/hr-job-history.service';
import { HrAbsencesService } from './services/hr-absences.service';
import { HrEmployeeDocumentsService } from './services/hr-employee-documents.service';
import { HrDepartmentsController } from './controllers/hr-departments.controller';
import { HrPositionsController } from './controllers/hr-positions.controller';
import { HrEmployeesController } from './controllers/hr-employees.controller';
import { HrContractsController } from './controllers/hr-contracts.controller';
import { HrSkillsController } from './controllers/hr-skills.controller';
import { HrTrainingsController } from './controllers/hr-trainings.controller';
import { HrJobHistoryController } from './controllers/hr-job-history.controller';
import { HrAbsencesController } from './controllers/hr-absences.controller';
import { HrEmployeeDocumentsController } from './controllers/hr-employee-documents.controller';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HrDepartment,
      HrPosition,
      HrEmployee,
      HrContract,
      HrSkill,
      HrEmployeeSkill,
      HrTraining,
      HrEmployeeTraining,
      HrJobHistory,
      HrAbsence,
      HrEmployeeDocument,
      Company,
      User,
    ]),
  ],
  providers: [
    HrDepartmentsService,
    HrPositionsService,
    HrEmployeesService,
    HrContractsService,
    HrSkillsService,
    HrTrainingsService,
    HrJobHistoryService,
    HrAbsencesService,
    HrEmployeeDocumentsService,
  ],
  controllers: [
    HrDepartmentsController,
    HrPositionsController,
    HrEmployeesController,
    HrContractsController,
    HrSkillsController,
    HrTrainingsController,
    HrJobHistoryController,
    HrAbsencesController,
    HrEmployeeDocumentsController,
  ],
  exports: [HrEmployeesService],
})
export class HrCoreModule {}

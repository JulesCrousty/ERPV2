import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WorkflowDefinition } from './entities/workflow-definition.entity';
import { WorkflowStepDefinition } from './entities/workflow-step-definition.entity';
import { WorkflowCondition } from './entities/workflow-condition.entity';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { WorkflowStepInstance } from './entities/workflow-step-instance.entity';
import { WorkflowAction } from './entities/workflow-action.entity';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';
import { HrDepartment } from '../hr/entities/hr-department.entity';
import { WorkflowDefinitionsService } from './services/workflow-definitions.service';
import { WorkflowInstancesService } from './services/workflow-instances.service';
import { WorkflowStepsService } from './services/workflow-steps.service';
import { WorkflowActionsService } from './services/workflow-actions.service';
import { WorkflowDefinitionsController } from './controllers/workflow-definitions.controller';
import { WorkflowInstancesController } from './controllers/workflow-instances.controller';
import { WorkflowActionsController } from './controllers/workflow-actions.controller';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      WorkflowDefinition,
      WorkflowStepDefinition,
      WorkflowCondition,
      WorkflowInstance,
      WorkflowStepInstance,
      WorkflowAction,
      Company,
      User,
      HrDepartment,
    ]),
  ],
  providers: [
    WorkflowDefinitionsService,
    WorkflowInstancesService,
    WorkflowStepsService,
    WorkflowActionsService,
  ],
  controllers: [
    WorkflowDefinitionsController,
    WorkflowInstancesController,
    WorkflowActionsController,
  ],
})
export class WorkflowModule {}

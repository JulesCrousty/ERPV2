import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproverType, WorkflowStepDefinition } from '../entities/workflow-step-definition.entity';
import {
  WorkflowStepInstance,
  WorkflowStepInstanceStatus,
} from '../entities/workflow-step-instance.entity';
import { WorkflowInstance } from '../entities/workflow-instance.entity';
import { User } from '../../auth/entities/user.entity';
import { HrDepartment } from '../../hr/entities/hr-department.entity';

@Injectable()
export class WorkflowStepsService {
  private readonly logger = new Logger(WorkflowStepsService.name);

  constructor(
    @InjectRepository(WorkflowStepInstance)
    private readonly stepInstancesRepository: Repository<WorkflowStepInstance>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(HrDepartment)
    private readonly departmentsRepository: Repository<HrDepartment>,
  ) {}

  async createStepInstance(
    workflowInstance: WorkflowInstance,
    stepDefinition: WorkflowStepDefinition,
  ): Promise<WorkflowStepInstance> {
    const stepInstance = this.stepInstancesRepository.create({
      workflowInstance,
      stepNumber: stepDefinition.stepNumber,
      status: WorkflowStepInstanceStatus.PENDING,
      startedAt: new Date(),
    });

    if (stepDefinition.approverType === ApproverType.USER) {
      const user = await this.usersRepository.findOne({
        where: { id: Number(stepDefinition.approverValue) },
      });
      if (!user) {
        throw new NotFoundException('Approver user not found');
      }
      stepInstance.assignedToUser = user;
    }

    if (stepDefinition.approverType === ApproverType.ROLE) {
      stepInstance.assignedToRole = stepDefinition.approverValue;
    }

    if (stepDefinition.approverType === ApproverType.DEPARTMENT) {
      const department = await this.departmentsRepository.findOne({
        where: { code: stepDefinition.approverValue },
      });
      if (!department) {
        throw new NotFoundException('Approver department not found');
      }
      stepInstance.assignedToDepartment = department;
    }

    this.logger.log('Step instance created', {
      stepNumber: stepDefinition.stepNumber,
      workflowInstanceId: workflowInstance.id,
    });

    return this.stepInstancesRepository.save(stepInstance);
  }
}

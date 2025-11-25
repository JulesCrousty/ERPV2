import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { WorkflowAction, WorkflowActionType } from '../entities/workflow-action.entity';
import { WorkflowStepInstance, WorkflowStepInstanceStatus } from '../entities/workflow-step-instance.entity';
import { WorkflowInstance, WorkflowInstanceStatus } from '../entities/workflow-instance.entity';
import { TakeActionDto } from '../dto/take-action.dto';
import { WorkflowInstancesService } from './workflow-instances.service';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class WorkflowActionsService {
  private readonly logger = new Logger(WorkflowActionsService.name);

  constructor(
    @InjectRepository(WorkflowAction)
    private readonly actionsRepository: Repository<WorkflowAction>,
    @InjectRepository(WorkflowStepInstance)
    private readonly stepInstancesRepository: Repository<WorkflowStepInstance>,
    @InjectRepository(WorkflowInstance)
    private readonly instancesRepository: Repository<WorkflowInstance>,
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly eventBus: EventEmitter2,
  ) {}

  async takeAction(dto: TakeActionDto, user: User): Promise<WorkflowAction> {
    const stepInstance = await this.stepInstancesRepository.findOne({
      where: { id: dto.step_instance_id },
      relations: ['workflowInstance', 'workflowInstance.workflowDefinition'],
    });
    if (!stepInstance) {
      throw new NotFoundException('Step instance not found');
    }

    if (!this.isUserAuthorized(stepInstance, user)) {
      throw new ForbiddenException('User not authorized for this step');
    }

    const action = this.actionsRepository.create({
      stepInstance,
      actionType: dto.action,
      comment: dto.comment ?? null,
      actedBy: user,
      actedAt: new Date(),
    });
    const savedAction = await this.actionsRepository.save(action);
    await this.applyAction(stepInstance, dto.action);

    this.logger.log('Workflow action recorded', {
      stepInstanceId: stepInstance.id,
      action: dto.action,
      actedBy: user.id,
    });

    return savedAction;
  }

  private isUserAuthorized(stepInstance: WorkflowStepInstance, user: User): boolean {
    if (stepInstance.assignedToUser && stepInstance.assignedToUser.id !== user.id) {
      return false;
    }
    if (stepInstance.assignedToRole && user.role?.name !== stepInstance.assignedToRole) {
      return false;
    }
    if (stepInstance.assignedToDepartment && (user as any).department?.id !== stepInstance.assignedToDepartment.id) {
      return false;
    }
    return true;
  }

  private async applyAction(stepInstance: WorkflowStepInstance, action: WorkflowActionType): Promise<void> {
    const workflowInstance = await this.instancesRepository.findOne({
      where: { id: stepInstance.workflowInstance.id },
      relations: ['workflowDefinition', 'workflowDefinition.steps'],
    });
    if (!workflowInstance) {
      throw new NotFoundException('Workflow instance not found');
    }

    if (action === WorkflowActionType.APPROVE) {
      stepInstance.status = WorkflowStepInstanceStatus.APPROVED;
      stepInstance.finishedAt = new Date();
      await this.stepInstancesRepository.save(stepInstance);

      this.eventBus.emit('WORKFLOW_APPROVED', {
        document_type: workflowInstance.documentType,
        document_id: workflowInstance.documentId,
      });

      const steps = [...workflowInstance.workflowDefinition.steps].sort((a, b) => a.stepNumber - b.stepNumber);
      const isLastStep = steps[steps.length - 1]?.stepNumber === stepInstance.stepNumber;
      if (isLastStep) {
        workflowInstance.status = WorkflowInstanceStatus.APPROVED;
        await this.instancesRepository.save(workflowInstance);
      }
      await this.workflowInstancesService.advanceStep(workflowInstance);
    } else if (action === WorkflowActionType.REJECT) {
      stepInstance.status = WorkflowStepInstanceStatus.REJECTED;
      stepInstance.finishedAt = new Date();
      await this.stepInstancesRepository.save(stepInstance);

      workflowInstance.status = WorkflowInstanceStatus.REJECTED;
      workflowInstance.currentStepNumber = null;
      await this.instancesRepository.save(workflowInstance);

      this.eventBus.emit('WORKFLOW_REJECTED', {
        document_type: workflowInstance.documentType,
        document_id: workflowInstance.documentId,
      });
    } else {
      stepInstance.status = WorkflowStepInstanceStatus.IN_PROGRESS;
      await this.stepInstancesRepository.save(stepInstance);
    }
  }
}

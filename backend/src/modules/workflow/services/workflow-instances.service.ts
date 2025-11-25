import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowDefinition } from '../entities/workflow-definition.entity';
import { WorkflowCondition } from '../entities/workflow-condition.entity';
import { WorkflowInstance, WorkflowInstanceStatus } from '../entities/workflow-instance.entity';
import { WorkflowStepDefinition } from '../entities/workflow-step-definition.entity';
import {
  WorkflowStepInstance,
  WorkflowStepInstanceStatus,
} from '../entities/workflow-step-instance.entity';
import { StartWorkflowDto } from '../dto/start-workflow.dto';
import { WorkflowStepsService } from './workflow-steps.service';
import { WorkflowAction, WorkflowActionType } from '../entities/workflow-action.entity';

@Injectable()
export class WorkflowInstancesService {
  private readonly logger = new Logger(WorkflowInstancesService.name);

  constructor(
    @InjectRepository(WorkflowDefinition)
    private readonly definitionsRepository: Repository<WorkflowDefinition>,
    @InjectRepository(WorkflowInstance)
    private readonly instancesRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowAction)
    private readonly actionsRepository: Repository<WorkflowAction>,
    @InjectRepository(WorkflowStepInstance)
    private readonly stepInstancesRepository: Repository<WorkflowStepInstance>,
    private readonly workflowStepsService: WorkflowStepsService,
  ) {}

  async startWorkflow(dto: StartWorkflowDto): Promise<WorkflowInstance> {
    const definitions = await this.definitionsRepository.find({
      where: {
        company: { id: dto.company_id },
        documentType: dto.document_type,
        isActive: true,
      },
      relations: ['steps', 'conditions'],
      order: { version: 'DESC' },
      take: 1,
    });
    if (!definitions.length) {
      throw new NotFoundException('Active workflow definition not found');
    }
    const definition = definitions[0];

    const steps = [...definition.steps].sort((a, b) => a.stepNumber - b.stepNumber);
    const firstStepNumber = this.determineFirstStepNumber(definition.conditions, dto.context, steps);
    const firstStepDefinition = steps.find((step) => step.stepNumber === firstStepNumber);

    const instance = this.instancesRepository.create({
      workflowDefinition: definition,
      documentType: dto.document_type,
      documentId: dto.document_id,
      status: WorkflowInstanceStatus.IN_REVIEW,
      currentStepNumber: firstStepNumber ?? null,
    });
    const savedInstance = await this.instancesRepository.save(instance);

    this.logger.log('Workflow started', {
      instance_id: savedInstance.id,
      document_type: dto.document_type,
      document_id: dto.document_id,
    });

    if (firstStepDefinition) {
      await this.createAndProcessStep(savedInstance, firstStepDefinition);
    }

    return this.instancesRepository.findOne({
      where: { id: savedInstance.id },
      relations: ['steps'],
    }) as Promise<WorkflowInstance>;
  }

  private determineFirstStepNumber(
    conditions: WorkflowCondition[],
    context: any,
    steps: WorkflowStepDefinition[],
  ): number | undefined {
    const ordered = [...(conditions || [])].sort((a, b) => a.priority - b.priority);
    for (const condition of ordered) {
      if (this.evaluateCondition(condition.expression, context)) {
        return condition.stepNumber;
      }
    }
    return steps[0]?.stepNumber;
  }

  private evaluateCondition(expression: string, context: any): boolean {
    try {
      // eslint-disable-next-line no-new-func
      const evaluator = new Function('doc', `return ${expression}`);
      return Boolean(evaluator(context));
    } catch (error) {
      this.logger.error('Failed to evaluate workflow condition', { expression, error });
      return false;
    }
  }

  async advanceStep(instance: WorkflowInstance): Promise<void> {
    const loadedInstance = await this.instancesRepository.findOne({
      where: { id: instance.id },
      relations: ['workflowDefinition', 'workflowDefinition.steps'],
    });
    if (!loadedInstance) {
      throw new NotFoundException('Workflow instance not found');
    }

    const sortedSteps = [...loadedInstance.workflowDefinition.steps].sort((a, b) => a.stepNumber - b.stepNumber);
    const currentIndex = sortedSteps.findIndex((step) => step.stepNumber === loadedInstance.currentStepNumber);
    const nextStepDefinition = sortedSteps[currentIndex + 1];

    if (!nextStepDefinition) {
      loadedInstance.status = WorkflowInstanceStatus.COMPLETED;
      loadedInstance.currentStepNumber = null;
      await this.instancesRepository.save(loadedInstance);
      this.logger.log('Workflow completed', { instance_id: loadedInstance.id });
      return;
    }

    loadedInstance.currentStepNumber = nextStepDefinition.stepNumber;
    loadedInstance.status = WorkflowInstanceStatus.IN_REVIEW;
    await this.instancesRepository.save(loadedInstance);
    await this.createAndProcessStep(loadedInstance, nextStepDefinition);
  }

  private async createAndProcessStep(
    instance: WorkflowInstance,
    stepDefinition: WorkflowStepDefinition,
  ): Promise<void> {
    const stepInstance = await this.workflowStepsService.createStepInstance(instance, stepDefinition);
    if (stepDefinition.autoApprove) {
      stepInstance.status = WorkflowStepInstanceStatus.APPROVED;
      stepInstance.finishedAt = new Date();
      await this.stepInstancesRepository.save(stepInstance);

      const action = this.actionsRepository.create({
        stepInstance,
        actionType: WorkflowActionType.APPROVE,
        comment: 'Auto-approved',
        actedBy: null,
        actedAt: new Date(),
      });
      await this.actionsRepository.save(action);
      this.logger.log('Auto approved step', { stepNumber: stepDefinition.stepNumber, instanceId: instance.id });
      await this.advanceStep(instance);
    }
  }

  async findAll(): Promise<WorkflowInstance[]> {
    return this.instancesRepository.find({ relations: ['steps'] });
  }

  async findOne(id: number): Promise<WorkflowInstance> {
    const instance = await this.instancesRepository.findOne({
      where: { id },
      relations: ['steps'],
    });
    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }
    return instance;
  }
}

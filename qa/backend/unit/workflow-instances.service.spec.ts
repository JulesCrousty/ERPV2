import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WorkflowInstancesService } from '../../../backend/src/modules/workflow/services/workflow-instances.service';
import { WorkflowStepsService } from '../../../backend/src/modules/workflow/services/workflow-steps.service';
import {
  WorkflowAction,
  WorkflowActionType,
} from '../../../backend/src/modules/workflow/entities/workflow-action.entity';
import {
  WorkflowCondition,
  WorkflowDefinition,
} from '../../../backend/src/modules/workflow/entities/workflow-definition.entity';
import { WorkflowInstance, WorkflowInstanceStatus } from '../../../backend/src/modules/workflow/entities/workflow-instance.entity';
import { WorkflowStepDefinition } from '../../../backend/src/modules/workflow/entities/workflow-step-definition.entity';
import { WorkflowStepInstance } from '../../../backend/src/modules/workflow/entities/workflow-step-instance.entity';
import { StartWorkflowDto } from '../../../backend/src/modules/workflow/dto/start-workflow.dto';

describe('WorkflowInstancesService (QA)', () => {
  let service: WorkflowInstancesService;
  let definitionsRepository: Partial<Repository<WorkflowDefinition>>;
  let instancesRepository: Partial<Repository<WorkflowInstance>>;
  let actionsRepository: Partial<Repository<WorkflowAction>>;
  let stepInstancesRepository: Partial<Repository<WorkflowStepInstance>>;
  let workflowStepsService: Partial<WorkflowStepsService>;

  beforeEach(() => {
    definitionsRepository = {
      find: jest.fn(),
    } as Partial<Repository<WorkflowDefinition>>;
    instancesRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as Partial<Repository<WorkflowInstance>>;
    actionsRepository = { save: jest.fn() } as Partial<Repository<WorkflowAction>>;
    stepInstancesRepository = { create: jest.fn(), save: jest.fn() } as Partial<Repository<WorkflowStepInstance>>;
    workflowStepsService = { processStep: jest.fn() } as Partial<WorkflowStepsService>;

    service = new WorkflowInstancesService(
      definitionsRepository as Repository<WorkflowDefinition>,
      instancesRepository as Repository<WorkflowInstance>,
      actionsRepository as Repository<WorkflowAction>,
      stepInstancesRepository as Repository<WorkflowStepInstance>,
      workflowStepsService as WorkflowStepsService,
    );
  });

  it('should compute the first step from matching conditions', async () => {
    const conditions: WorkflowCondition[] = [
      { id: 1, expression: 'doc.amount > 1000', priority: 2, stepNumber: 2 } as WorkflowCondition,
      { id: 2, expression: 'doc.amount <= 1000', priority: 1, stepNumber: 1 } as WorkflowCondition,
    ];
    const steps: WorkflowStepDefinition[] = [
      { id: 10, stepNumber: 1 } as WorkflowStepDefinition,
      { id: 11, stepNumber: 2 } as WorkflowStepDefinition,
    ];

    const first = (service as any).determineFirstStepNumber(conditions, { amount: 500 }, steps);
    expect(first).toBe(1);
    const second = (service as any).determineFirstStepNumber(conditions, { amount: 5000 }, steps);
    expect(second).toBe(2);
  });

  it('should start a workflow using the first sorted step when no conditions match', async () => {
    const definition: WorkflowDefinition = {
      id: 1,
      version: 1,
      steps: [
        { id: 1, stepNumber: 5 } as WorkflowStepDefinition,
        { id: 2, stepNumber: 10 } as WorkflowStepDefinition,
      ],
      conditions: [],
    } as WorkflowDefinition;
    (definitionsRepository.find as jest.Mock).mockResolvedValue([definition]);
    (instancesRepository.create as jest.Mock).mockReturnValue({ id: 100, workflowDefinition: definition });
    (instancesRepository.save as jest.Mock).mockImplementation(async (instance) => ({ ...instance, id: 100 }));
    (instancesRepository.findOne as jest.Mock).mockResolvedValue({ id: 100, steps: [] } as WorkflowInstance);

    const dto: StartWorkflowDto = { company_id: 1, document_type: 'FI', document_id: 99, context: {} };
    const instance = await service.startWorkflow(dto);

    expect(instance.id).toBe(100);
    expect(instancesRepository.save).toHaveBeenCalled();
    expect(workflowStepsService.processStep).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when definition is missing', async () => {
    (definitionsRepository.find as jest.Mock).mockResolvedValue([]);
    const dto: StartWorkflowDto = { company_id: 1, document_type: 'FI', document_id: 99, context: {} };

    await expect(service.startWorkflow(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should mark workflow completed when there is no next step', async () => {
    const instance: WorkflowInstance = {
      id: 1,
      workflowDefinition: {
        steps: [{ id: 1, stepNumber: 1 } as WorkflowStepDefinition],
      } as WorkflowDefinition,
      currentStepNumber: 1,
      status: WorkflowInstanceStatus.IN_REVIEW,
    } as WorkflowInstance;

    (instancesRepository.findOne as jest.Mock).mockResolvedValue({ ...instance });
    (instancesRepository.save as jest.Mock).mockImplementation(async (data) => data);

    await service.advanceStep(instance);
    expect(instancesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: WorkflowInstanceStatus.COMPLETED, currentStepNumber: null }),
    );
  });

  it('should register an approval action', async () => {
    const instance = { id: 1 } as WorkflowInstance;
    const actorId = 55;

    await service['logAction'](instance, WorkflowActionType.APPROVED, actorId, 'ok');

    expect(actionsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowInstance: instance,
        actorId,
        comments: 'ok',
        type: WorkflowActionType.APPROVED,
      }),
    );
  });
});

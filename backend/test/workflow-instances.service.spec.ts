import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowInstancesService } from '../src/modules/workflow/services/workflow-instances.service';
import { WorkflowStepsService } from '../src/modules/workflow/services/workflow-steps.service';
import { WorkflowActionsService } from '../src/modules/workflow/services/workflow-actions.service';
import { WorkflowInstanceStatus } from '../src/modules/workflow/entities/workflow-instance.entity';
import { WorkflowStepInstanceStatus } from '../src/modules/workflow/entities/workflow-step-instance.entity';
import { WorkflowActionType } from '../src/modules/workflow/entities/workflow-action.entity';

const createRepositoryMock = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('Workflow Instances and Actions', () => {
  const definitionsRepository = createRepositoryMock();
  const conditionsRepository = createRepositoryMock();
  const instancesRepository = createRepositoryMock();
  const stepDefinitionsRepository = createRepositoryMock();
  const actionsRepository = createRepositoryMock();
  const stepInstancesRepository = createRepositoryMock();
  const usersRepository = createRepositoryMock();
  const departmentsRepository = createRepositoryMock();

  let stepsService: WorkflowStepsService;
  let instancesService: WorkflowInstancesService;

  beforeEach(() => {
    jest.clearAllMocks();
    stepsService = new WorkflowStepsService(
      stepInstancesRepository as any,
      usersRepository as any,
      departmentsRepository as any,
    );
    instancesService = new WorkflowInstancesService(
      definitionsRepository as any,
      conditionsRepository as any,
      instancesRepository as any,
      stepDefinitionsRepository as any,
      actionsRepository as any,
      stepInstancesRepository as any,
      stepsService,
    );
  });

  it('startWorkflow creates instance', async () => {
    const definition = {
      id: 1,
      conditions: [],
      steps: [{ stepNumber: 1, autoApprove: false }],
    } as any;
    (definitionsRepository.find as jest.Mock).mockResolvedValue([definition]);
    (instancesRepository.create as jest.Mock).mockImplementation((data) => ({ ...data, id: 10 }));
    (instancesRepository.save as jest.Mock).mockResolvedValue({ ...definition, id: 10 });
    jest.spyOn(stepsService, 'createStepInstance').mockResolvedValue({ id: 1 } as any);

    const result = await instancesService.startWorkflow({
      company_id: 1,
      document_id: 5,
      document_type: 'TEST',
      context: {},
    } as any);

    expect(result).toBeDefined();
    expect(instancesRepository.save).toHaveBeenCalled();
    expect(stepsService.createStepInstance).toHaveBeenCalled();
  });

  it('conditions route to proper step', async () => {
    const definition = {
      id: 2,
      conditions: [{ expression: 'doc.amount > 100', stepNumber: 2, priority: 1 }],
      steps: [
        { stepNumber: 1, autoApprove: false },
        { stepNumber: 2, autoApprove: false },
      ],
    } as any;
    (definitionsRepository.find as jest.Mock).mockResolvedValue([definition]);
    (instancesRepository.create as jest.Mock).mockImplementation((data) => ({ ...data, id: 11 }));
    (instancesRepository.save as jest.Mock).mockResolvedValue({ ...definition, id: 11 });
    const createSpy = jest
      .spyOn(stepsService, 'createStepInstance')
      .mockResolvedValue({ id: 2, stepNumber: 2 } as any);

    await instancesService.startWorkflow({
      company_id: 1,
      document_id: 5,
      document_type: 'TEST',
      context: { amount: 200 },
    } as any);

    expect(createSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ stepNumber: 2 }));
  });

  it('approve moves to next step', async () => {
    const stepInstance = {
      id: 1,
      stepNumber: 1,
      assignedToUser: { id: 1 },
      workflowInstance: { id: 99, documentType: 'DOC', documentId: 100, workflowDefinition: { steps: [{ stepNumber: 1 }, { stepNumber: 2 }] } },
    } as any;
    (stepInstancesRepository.findOne as jest.Mock).mockResolvedValue(stepInstance);
    (actionsRepository.create as jest.Mock).mockImplementation((data) => data);
    (actionsRepository.save as jest.Mock).mockImplementation(async (data) => data);
    (stepInstancesRepository.save as jest.Mock).mockImplementation(async (data) => data);
    (instancesRepository.findOne as jest.Mock).mockResolvedValue(stepInstance.workflowInstance);
    (instancesRepository.save as jest.Mock).mockImplementation(async (data) => data);

    const workflowInstancesService = { advanceStep: jest.fn() } as any;
    const eventBus = { emit: jest.fn() } as unknown as EventEmitter2;
    const actionsService = new WorkflowActionsService(
      actionsRepository as any,
      stepInstancesRepository as any,
      instancesRepository as any,
      workflowInstancesService,
      eventBus,
    );

    await actionsService.takeAction(
      { step_instance_id: 1, action: WorkflowActionType.APPROVE },
      { id: 1, role: { name: 'MANAGER' } } as any,
    );

    expect(workflowInstancesService.advanceStep).toHaveBeenCalled();
    expect(stepInstancesRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: WorkflowStepInstanceStatus.APPROVED }));
  });

  it('reject ends workflow', async () => {
    const workflowInstance = {
      id: 5,
      documentType: 'DOC',
      documentId: 50,
      workflowDefinition: { steps: [{ stepNumber: 1 }] },
    } as any;
    const stepInstance = { id: 2, stepNumber: 1, assignedToUser: { id: 1 }, workflowInstance } as any;
    (stepInstancesRepository.findOne as jest.Mock).mockResolvedValue(stepInstance);
    (instancesRepository.findOne as jest.Mock).mockResolvedValue(workflowInstance);
    const eventBus = { emit: jest.fn() } as unknown as EventEmitter2;
    const actionsService = new WorkflowActionsService(
      actionsRepository as any,
      stepInstancesRepository as any,
      instancesRepository as any,
      { advanceStep: jest.fn() } as any,
      eventBus,
    );

    await actionsService.takeAction(
      { step_instance_id: 2, action: WorkflowActionType.REJECT },
      { id: 1, role: { name: 'MANAGER' } } as any,
    );

    expect(instancesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: WorkflowInstanceStatus.REJECTED, currentStepNumber: null }),
    );
    expect(eventBus.emit).toHaveBeenCalledWith('WORKFLOW_REJECTED', expect.anything());
  });

  it('unauthorized user throws error', async () => {
    const stepInstance = { id: 3, assignedToUser: { id: 1 }, workflowInstance: { workflowDefinition: { steps: [] } } } as any;
    (stepInstancesRepository.findOne as jest.Mock).mockResolvedValue(stepInstance);
    const actionsService = new WorkflowActionsService(
      actionsRepository as any,
      stepInstancesRepository as any,
      instancesRepository as any,
      { advanceStep: jest.fn() } as any,
      { emit: jest.fn() } as unknown as EventEmitter2,
    );

    await expect(
      actionsService.takeAction({ step_instance_id: 3, action: WorkflowActionType.APPROVE }, { id: 2 } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws if no step instance found', async () => {
    (stepInstancesRepository.findOne as jest.Mock).mockResolvedValue(null);
    const actionsService = new WorkflowActionsService(
      actionsRepository as any,
      stepInstancesRepository as any,
      instancesRepository as any,
      { advanceStep: jest.fn() } as any,
      { emit: jest.fn() } as unknown as EventEmitter2,
    );

    await expect(
      actionsService.takeAction({ step_instance_id: 99, action: WorkflowActionType.APPROVE }, { id: 1 } as any),
    ).rejects.toThrow(NotFoundException);
  });
});

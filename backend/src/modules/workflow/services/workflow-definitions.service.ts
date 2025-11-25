import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowDefinition } from '../entities/workflow-definition.entity';
import { WorkflowStepDefinition } from '../entities/workflow-step-definition.entity';
import { WorkflowCondition } from '../entities/workflow-condition.entity';
import { CreateWorkflowDefinitionDto } from '../dto/create-workflow-definition.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class WorkflowDefinitionsService {
  private readonly logger = new Logger(WorkflowDefinitionsService.name);

  constructor(
    @InjectRepository(WorkflowDefinition)
    private readonly definitionsRepository: Repository<WorkflowDefinition>,
    @InjectRepository(WorkflowStepDefinition)
    private readonly stepDefinitionsRepository: Repository<WorkflowStepDefinition>,
    @InjectRepository(WorkflowCondition)
    private readonly conditionsRepository: Repository<WorkflowCondition>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async createDefinition(dto: CreateWorkflowDefinitionDto): Promise<WorkflowDefinition> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existing = await this.definitionsRepository.findOne({
      where: {
        company: { id: dto.company_id },
        documentType: dto.document_type,
        version: dto.version,
      },
    });
    if (existing) {
      throw new BadRequestException('Workflow definition version already exists');
    }

    const definition = this.definitionsRepository.create({
      company,
      name: dto.name,
      documentType: dto.document_type,
      version: dto.version,
      isActive: true,
    });
    const savedDefinition = await this.definitionsRepository.save(definition);

    const steps = dto.steps.map((stepDto) =>
      this.stepDefinitionsRepository.create({
        workflowDefinition: savedDefinition,
        stepNumber: stepDto.step_number,
        name: stepDto.name,
        approverType: stepDto.approver_type,
        approverValue: stepDto.approver_value,
        autoApprove: stepDto.auto_approve,
      }),
    );
    await this.stepDefinitionsRepository.save(steps);

    if (dto.conditions?.length) {
      const conditions = dto.conditions.map((conditionDto) =>
        this.conditionsRepository.create({
          workflowDefinition: savedDefinition,
          expression: conditionDto.expression,
          stepNumber: conditionDto.step_number,
          priority: conditionDto.priority,
        }),
      );
      await this.conditionsRepository.save(conditions);
    }

    const fullDefinition = await this.definitionsRepository.findOne({
      where: { id: savedDefinition.id },
      relations: ['steps', 'conditions'],
    });

    this.logger.log('Workflow definition created', {
      companyId: dto.company_id,
      documentType: dto.document_type,
      version: dto.version,
    });

    return fullDefinition as WorkflowDefinition;
  }

  async findAll(): Promise<WorkflowDefinition[]> {
    return this.definitionsRepository.find({ relations: ['steps', 'conditions'] });
  }

  async findOne(id: number): Promise<WorkflowDefinition> {
    const definition = await this.definitionsRepository.findOne({
      where: { id },
      relations: ['steps', 'conditions'],
    });
    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }
    return definition;
  }
}

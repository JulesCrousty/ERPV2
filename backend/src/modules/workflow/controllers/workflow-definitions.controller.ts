import { Body, Controller, Get, Logger, Param, ParseIntPipe, Post } from '@nestjs/common';
import { WorkflowDefinitionsService } from '../services/workflow-definitions.service';
import { CreateWorkflowDefinitionDto } from '../dto/create-workflow-definition.dto';

@Controller('workflow/definitions')
export class WorkflowDefinitionsController {
  private readonly logger = new Logger(WorkflowDefinitionsController.name);

  constructor(private readonly workflowDefinitionsService: WorkflowDefinitionsService) {}

  @Post('create')
  async create(@Body() dto: CreateWorkflowDefinitionDto) {
    const definition = await this.workflowDefinitionsService.createDefinition(dto);
    this.logger.log('Definition created via API', { id: definition.id });
    return definition;
  }

  @Get()
  async findAll() {
    this.logger.log('Listing workflow definitions');
    return this.workflowDefinitionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log('Fetching workflow definition', { id });
    return this.workflowDefinitionsService.findOne(id);
  }
}

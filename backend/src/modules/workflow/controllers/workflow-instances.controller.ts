import { Body, Controller, Get, Logger, Param, ParseIntPipe, Post } from '@nestjs/common';
import { WorkflowInstancesService } from '../services/workflow-instances.service';
import { StartWorkflowDto } from '../dto/start-workflow.dto';

@Controller('workflow/instances')
export class WorkflowInstancesController {
  private readonly logger = new Logger(WorkflowInstancesController.name);

  constructor(private readonly workflowInstancesService: WorkflowInstancesService) {}

  @Post('start')
  async start(@Body() dto: StartWorkflowDto) {
    this.logger.log('Starting workflow via API', { documentType: dto.document_type, documentId: dto.document_id });
    return this.workflowInstancesService.startWorkflow(dto);
  }

  @Get()
  async findAll() {
    this.logger.log('Listing workflow instances');
    return this.workflowInstancesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log('Fetching workflow instance', { id });
    return this.workflowInstancesService.findOne(id);
  }
}

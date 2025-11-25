import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { WorkflowActionsService } from '../services/workflow-actions.service';
import { TakeActionDto } from '../dto/take-action.dto';

@Controller('workflow/actions')
export class WorkflowActionsController {
  private readonly logger = new Logger(WorkflowActionsController.name);

  constructor(private readonly workflowActionsService: WorkflowActionsService) {}

  @Post('take')
  async take(@Body() dto: TakeActionDto, @Req() req: any) {
    this.logger.log('Taking workflow action', { stepInstanceId: dto.step_instance_id });
    return this.workflowActionsService.takeAction(dto, req.user);
  }
}

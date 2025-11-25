import { Body, Controller, Patch, Param } from '@nestjs/common';
import { WmWarehouseTasksService } from '../services/wm-warehouse-tasks.service';
import { UpdateWarehouseTaskStatusDto } from '../dto/update-warehouse-task-status.dto';

@Controller('wm/warehouse-tasks')
export class WmWarehouseTasksController {
  constructor(private readonly warehouseTasksService: WmWarehouseTasksService) {}

  @Patch(':task_id/status')
  updateStatus(@Param('task_id') taskId: string, @Body() dto: UpdateWarehouseTaskStatusDto) {
    return this.warehouseTasksService.updateStatus(Number(taskId), dto);
  }
}

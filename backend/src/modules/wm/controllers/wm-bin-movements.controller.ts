import { Body, Controller, Post } from '@nestjs/common';
import { WmBinMovementsService } from '../services/wm-bin-movements.service';
import { CreateBinMovementDto } from '../dto/create-bin-movement.dto';

@Controller('wm/bin-movements')
export class WmBinMovementsController {
  constructor(private readonly binMovementsService: WmBinMovementsService) {}

  @Post('move')
  move(@Body() dto: CreateBinMovementDto) {
    return this.binMovementsService.moveStock(dto);
  }
}

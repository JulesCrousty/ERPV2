import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MmGoodsReceiptsService } from '../services/mm-goods-receipts.service';
import { CreateGoodsReceiptDto } from '../dto/create-goods-receipt.dto';
import { ReverseGoodsReceiptDto } from '../dto/reverse-goods-receipt.dto';

@Controller('mm/goods-receipts')
export class MmGoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: MmGoodsReceiptsService) {}

  @Post()
  create(@Body() dto: CreateGoodsReceiptDto) {
    return this.goodsReceiptsService.create(dto);
  }

  @Get()
  findAll() {
    return this.goodsReceiptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goodsReceiptsService.findOne(Number(id));
  }

  @Post(':id/reverse')
  reverse(@Param('id') id: string, @Body() dto: ReverseGoodsReceiptDto) {
    return this.goodsReceiptsService.reverse(Number(id), dto);
  }
}

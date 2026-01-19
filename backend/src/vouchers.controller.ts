import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) { }

  @Get('validate')
  async validate(@Query('code') code: string, @Query('amount') amount: string) {
    if (!code) throw new BadRequestException('Code is required');
    const amountNum = Number(amount) || 0;
    return this.vouchersService.validate(code, amountNum);
  }
}

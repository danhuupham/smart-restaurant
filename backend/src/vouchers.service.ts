import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) { }

  async validate(code: string, amount: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      throw new BadRequestException('Mã giảm giá không tồn tại');
    }

    if (!voucher.isActive) throw new BadRequestException('Mã giảm giá đã hết hạn hoặc bị khóa');
    if (voucher.expiryDate && new Date() > voucher.expiryDate) throw new BadRequestException('Mã giảm giá đã hết hạn');
    if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    if (voucher.minOrderAmount && amount < Number(voucher.minOrderAmount)) throw new BadRequestException(`Đơn hàng phải tối thiểu ${voucher.minOrderAmount} để sử dụng mã này`);

    return voucher;
  }
}

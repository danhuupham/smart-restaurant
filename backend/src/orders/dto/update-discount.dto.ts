import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateDiscountDto {
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue?: number;
}

import { IsString, IsInt, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { PointsTransactionType } from '@prisma/client';

export class CreatePointsTransactionDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  points: number; // Positive for EARN, negative for REDEEM

  @IsEnum(PointsTransactionType)
  type: PointsTransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  orderId?: string;
}

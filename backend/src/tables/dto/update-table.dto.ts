
import { PartialType } from '@nestjs/mapped-types';
import { CreateTableDto } from './create-table.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTableDto extends PartialType(CreateTableDto) {
    @IsOptional()
    @IsEnum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'INACTIVE'])
    status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE';
}

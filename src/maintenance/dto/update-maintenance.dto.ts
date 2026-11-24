import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMaintenanceDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

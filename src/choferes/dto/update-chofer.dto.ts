import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoChofer } from '../../generated/prisma/enums.js';

export class UpdateChoferDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  Nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  Apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  NumeroLicencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  Telefono?: string;

  @IsOptional()
  @IsIn([EstadoChofer.Libre, EstadoChofer.FueraDeServicio, EstadoChofer.Vacaciones], {
    message: 'EstadoChofer debe ser Libre, FueraDeServicio o Vacaciones',
  })
  EstadoChofer?: EstadoChofer;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  IngresoTurno?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  FinalizacionTurno?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  MaxViajes?: number;
}

import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
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
  @Matches(/^[0-9]+$/, {
    message: 'El número de licencia debe contener solo dígitos numéricos positivos',
  })
  NumeroLicencia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  @Matches(/^\+?[0-9\s\-()]{6,20}$/, {
    message: 'El teléfono debe tener un formato válido (entre 6 y 20 caracteres numéricos)',
  })
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

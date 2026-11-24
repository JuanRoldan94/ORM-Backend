import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoChofer } from '../../generated/prisma/enums.js';

export class CreateChoferDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  Nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  Apellido: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Matches(/^[0-9]+$/, {
    message: 'El número de licencia debe contener solo dígitos numéricos positivos',
  })
  NumeroLicencia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Matches(/^\+?[0-9\s\-()]{6,20}$/, {
    message: 'El teléfono debe tener un formato válido (entre 6 y 20 caracteres numéricos)',
  })
  Telefono: string;

  // "EnViaje" no se carga a mano: lo pone el sistema al asignarle un viaje.
  @IsIn([EstadoChofer.Libre, EstadoChofer.FueraDeServicio, EstadoChofer.Vacaciones], {
    message: 'EstadoChofer debe ser Libre, FueraDeServicio o Vacaciones',
  })
  EstadoChofer: EstadoChofer;

  @Type(() => Date)
  @IsDate()
  IngresoTurno: Date;

  @Type(() => Date)
  @IsDate()
  FinalizacionTurno: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  IdVehiculoActual?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  MaxViajes?: number;
}

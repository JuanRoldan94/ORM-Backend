import { IsEnum, IsOptional } from 'class-validator';
import { EstadoOperativo } from '../../generated/prisma/enums.js';

export class FiltroVehiculosDto {
  @IsOptional()
  @IsEnum(EstadoOperativo)
  EstadoOperativo?: EstadoOperativo;
}

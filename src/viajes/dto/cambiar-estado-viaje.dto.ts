import { IsEnum } from 'class-validator';
import { EstadoDeViaje } from '../../generated/prisma/enums.js';

export class CambiarEstadoViajeDto {
  @IsEnum(EstadoDeViaje)
  EstadoViaje: EstadoDeViaje;
}

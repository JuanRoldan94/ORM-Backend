import { IsEnum, IsOptional } from 'class-validator';
import { EstadoChofer } from '../../generated/prisma/enums.js';

// Ej.: GET /choferes?EstadoChofer=Libre para ver a quién se le puede asignar un viaje.
export class FiltroChoferesDto {
  @IsOptional()
  @IsEnum(EstadoChofer)
  EstadoChofer?: EstadoChofer;
}

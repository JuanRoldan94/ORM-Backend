import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { EstadoDeViaje } from '../../generated/prisma/enums.js';

// RF-3: listar viajes activos o históricos. Ej.: GET /viajes?tipo=activos
export class FiltroViajesDto {
  @IsOptional()
  @IsIn(['activos', 'historicos'])
  tipo?: 'activos' | 'historicos';

  @IsOptional()
  @IsEnum(EstadoDeViaje)
  EstadoViaje?: EstadoDeViaje;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  IdChofer?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  IdCliente?: number;
}

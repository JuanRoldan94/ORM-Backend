import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// El viaje se crea siempre en estado Pendiente, sin chofer ni vehículo (RF-3).
export class CreateViajeDto {
  // RB-1: sin dirección de origen no se puede dar de alta un viaje.
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  DireccionOrigen: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  DireccionDestino: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  Observaciones?: string;

  @IsInt()
  @Min(1)
  IdCliente: number;

  // Cuando exista el login (RF-2) se toma del usuario autenticado.
  @IsInt()
  @Min(1)
  IdOperador: number;
}

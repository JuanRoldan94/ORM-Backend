import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { EstadoOperativo } from '../../generated/prisma/enums.js';

export class CreateVehiculoDto {
  // Se guarda en mayúsculas y sin espacios en los extremos para que "ab123cd"
  // y "AB123CD" se consideren la misma patente.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  Patente: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  Marca: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  Modelo: string;

  @IsEnum(EstadoOperativo)
  EstadoOperativo: EstadoOperativo;
}

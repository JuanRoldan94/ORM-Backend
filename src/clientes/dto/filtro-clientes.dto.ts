import { IsOptional, IsString } from 'class-validator';

// Para buscar al cliente cuando llama (por teléfono o por nombre).
export class FiltroClientesDto {
  @IsOptional()
  @IsString()
  Telefono?: string;

  @IsOptional()
  @IsString()
  ApellidoYNombre?: string;
}

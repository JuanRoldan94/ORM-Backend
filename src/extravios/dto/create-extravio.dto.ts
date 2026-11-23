import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateExtravioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  Descripcion: string;

  @IsInt()
  @Min(1)
  IdViaje: number;

  // Tiene que ser el cliente del viaje.
  @IsInt()
  @Min(1)
  IdCliente: number;
}

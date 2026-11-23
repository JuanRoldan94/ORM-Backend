import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  Telefono: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  ApellidoYNombre: string;
}

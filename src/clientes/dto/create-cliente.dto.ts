import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @Matches(/^\+?[0-9\s\-()]{6,20}$/, {
    message: 'El teléfono debe tener un formato válido (entre 6 y 20 caracteres numéricos)',
  })
  Telefono: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  ApellidoYNombre: string;
}

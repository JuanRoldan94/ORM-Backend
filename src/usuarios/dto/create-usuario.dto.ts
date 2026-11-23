import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Roles } from '../../generated/prisma/enums.js';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  Nombre: string;

  @IsEmail()
  @MaxLength(191)
  Mail: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  Contrasenia: string;

  @IsEnum(Roles)
  Rol: Roles;
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Roles } from '../generated/prisma/enums.js';
import { hashContrasenia } from '../common/contrasenia.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

// La contraseña nunca sale en las respuestas.
const SIN_CONTRASENIA = { Contrasenia: true } as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const { Contrasenia, ...datos } = dto;
    return this.prisma.usuario.create({
      data: { ...datos, Contrasenia: await hashContrasenia(Contrasenia) },
      omit: SIN_CONTRASENIA,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      where: { Activo: true },
      omit: SIN_CONTRASENIA,
      orderBy: { IdUsuario: 'asc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { IdUsuario: id, Activo: true },
      omit: SIN_CONTRASENIA,
    });
    if (!usuario) {
      throw new NotFoundException(`No existe un usuario con id ${id}`);
    }
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    const { Contrasenia, ...datos } = dto;
    return this.prisma.usuario.update({
      where: { IdUsuario: id },
      data: Contrasenia
        ? { ...datos, Contrasenia: await hashContrasenia(Contrasenia) }
        : datos,
      omit: SIN_CONTRASENIA,
    });
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    if (usuario.Rol === Roles.Duenio || usuario.Rol === Roles.Administrador) {
      const adminsRestantes = await this.prisma.usuario.count({
        where: {
          Activo: true,
          Rol: { in: [Roles.Duenio, Roles.Administrador] },
          IdUsuario: { not: id },
        },
      });
      if (adminsRestantes === 0) {
        throw new ConflictException(
          'No se puede desactivar al único usuario con rol Dueño o Administrador del sistema',
        );
      }
    }

    return this.prisma.usuario.update({
      where: { IdUsuario: id },
      data: { Activo: false },
      omit: SIN_CONTRASENIA,
    });
  }
}

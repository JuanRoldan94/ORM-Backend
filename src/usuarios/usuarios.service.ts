import { Injectable, NotFoundException } from '@nestjs/common';
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
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { IdUsuario: id },
      data: { Activo: false },
      omit: SIN_CONTRASENIA,
    });
  }
}

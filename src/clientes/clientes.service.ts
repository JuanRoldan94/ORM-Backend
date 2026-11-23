import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ESTADOS_ACTIVOS } from '../viajes/estados-viaje.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { FiltroClientesDto } from './dto/filtro-clientes.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  findAll(filtro: FiltroClientesDto) {
    return this.prisma.cliente.findMany({
      where: {
        Activo: true,
        Telefono: filtro.Telefono ? { contains: filtro.Telefono } : undefined,
        ApellidoYNombre: filtro.ApellidoYNombre
          ? { contains: filtro.ApellidoYNombre }
          : undefined,
      },
      orderBy: { ApellidoYNombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { IdCliente: id, Activo: true },
    });
    if (!cliente) {
      throw new NotFoundException(`No existe un cliente con id ${id}`);
    }
    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { IdCliente: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    const viajesActivos = await this.prisma.viaje.count({
      where: {
        IdCliente: id,
        Activo: true,
        EstadoViaje: { in: ESTADOS_ACTIVOS },
      },
    });
    if (viajesActivos > 0) {
      throw new ConflictException(
        'No se puede eliminar un cliente que tiene viajes sin terminar',
      );
    }
    return this.prisma.cliente.update({
      where: { IdCliente: id },
      data: { Activo: false },
    });
  }
}

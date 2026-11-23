import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ViajesService } from '../viajes/viajes.service.js';
import { CreateExtravioDto } from './dto/create-extravio.dto.js';
import { FiltroExtraviosDto } from './dto/filtro-extravios.dto.js';
import { UpdateExtravioDto } from './dto/update-extravio.dto.js';

const INCLUDE_EXTRAVIO = {
  Viaje: {
    select: {
      IdViaje: true,
      DireccionOrigen: true,
      DireccionDestino: true,
      EstadoViaje: true,
      CreadoEl: true,
    },
  },
  Cliente: true,
} satisfies Prisma.ExtravioInclude;

@Injectable()
export class ExtraviosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly viajesService: ViajesService,
  ) {}

  async create(dto: CreateExtravioDto) {
    await this.validarViajeYCliente(dto.IdViaje, dto.IdCliente);
    return this.prisma.extravio.create({
      data: dto,
      include: INCLUDE_EXTRAVIO,
    });
  }

  findAll(filtro: FiltroExtraviosDto) {
    return this.prisma.extravio.findMany({
      where: {
        Activo: true,
        IdViaje: filtro.IdViaje,
        IdCliente: filtro.IdCliente,
      },
      include: INCLUDE_EXTRAVIO,
      orderBy: { CreadoEl: 'desc' },
    });
  }

  async findOne(id: number) {
    const extravio = await this.prisma.extravio.findFirst({
      where: { IdExtravio: id, Activo: true },
      include: INCLUDE_EXTRAVIO,
    });
    if (!extravio) {
      throw new NotFoundException(`No existe un extravío con id ${id}`);
    }
    return extravio;
  }

  async update(id: number, dto: UpdateExtravioDto) {
    const extravio = await this.findOne(id);
    if (dto.IdViaje || dto.IdCliente) {
      await this.validarViajeYCliente(
        dto.IdViaje ?? extravio.IdViaje,
        dto.IdCliente ?? extravio.IdCliente,
      );
    }
    return this.prisma.extravio.update({
      where: { IdExtravio: id },
      data: dto,
      include: INCLUDE_EXTRAVIO,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.extravio.update({
      where: { IdExtravio: id },
      data: { Activo: false },
      include: INCLUDE_EXTRAVIO,
    });
  }

  private async validarViajeYCliente(idViaje: number, idCliente: number) {
    const viaje = await this.viajesService.findOne(idViaje);
    if (viaje.IdCliente !== idCliente) {
      throw new BadRequestException(
        `El cliente ${idCliente} no es el cliente del viaje ${idViaje} (el cliente del viaje es ${viaje.IdCliente})`,
      );
    }
  }
}

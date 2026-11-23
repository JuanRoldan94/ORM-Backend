import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoOperativo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ESTADOS_EN_SERVICIO } from '../viajes/estados-viaje.js';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto.js';
import { FiltroVehiculosDto } from './dto/filtro-vehiculos.dto.js';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto.js';

@Injectable()
export class VehiculosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVehiculoDto) {
    return this.prisma.vehiculo.create({ data: dto });
  }

  findAll(filtro: FiltroVehiculosDto) {
    return this.prisma.vehiculo.findMany({
      where: { Activo: true, EstadoOperativo: filtro.EstadoOperativo },
      orderBy: { Patente: 'asc' },
    });
  }

  async findOne(id: number) {
    const vehiculo = await this.prisma.vehiculo.findFirst({
      where: { IdVehiculo: id, Activo: true },
    });
    if (!vehiculo) {
      throw new NotFoundException(`No existe un vehículo con id ${id}`);
    }
    return vehiculo;
  }

  async update(id: number, dto: UpdateVehiculoDto) {
    await this.findOne(id);
    if (dto.EstadoOperativo === EstadoOperativo.NoOperativo) {
      const viajesEnServicio = await this.prisma.viaje.count({
        where: {
          IdVehiculo: id,
          Activo: true,
          EstadoViaje: { in: ESTADOS_EN_SERVICIO },
        },
      });
      if (viajesEnServicio > 0) {
        throw new ConflictException(
          'No se puede marcar como No Operativo un vehículo que está siendo usado en un viaje en curso',
        );
      }
    }
    return this.prisma.vehiculo.update({
      where: { IdVehiculo: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const viajesEnServicio = await this.prisma.viaje.count({
      where: {
        IdVehiculo: id,
        Activo: true,
        EstadoViaje: { in: ESTADOS_EN_SERVICIO },
      },
    });
    if (viajesEnServicio > 0) {
      throw new ConflictException(
        'No se puede eliminar un vehículo que está siendo usado en un viaje',
      );
    }
    // Los choferes que lo tenían como vehículo actual quedan sin vehículo.
    return this.prisma.$transaction(async (tx) => {
      await tx.chofer.updateMany({
        where: { IdVehiculoActual: id },
        data: { IdVehiculoActual: null },
      });
      return tx.vehiculo.update({
        where: { IdVehiculo: id },
        data: { Activo: false },
      });
    });
  }
}

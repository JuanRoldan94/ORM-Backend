import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoChofer, EstadoOperativo } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VehiculosService } from '../vehiculos/vehiculos.service.js';
import { ESTADOS_ACTIVOS } from '../viajes/estados-viaje.js';
import { AsignarVehiculoDto } from './dto/asignar-vehiculo.dto.js';
import { CreateChoferDto } from './dto/create-chofer.dto.js';
import { FiltroChoferesDto } from './dto/filtro-choferes.dto.js';
import { UpdateChoferDto } from './dto/update-chofer.dto.js';

const CON_VEHICULO = {
  VehiculoActual: true,
  Viajes: {
    where: {
      Activo: true,
      EstadoViaje: { in: ESTADOS_ACTIVOS },
    },
    select: { IdViaje: true, EstadoViaje: true },
  },
} as const;

@Injectable()
export class ChoferesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiculosService: VehiculosService,
  ) {}

  async create(dto: CreateChoferDto) {
    this.validarTurno(dto.IngresoTurno, dto.FinalizacionTurno);
    if (dto.IdVehiculoActual) {
      const vehiculo = await this.vehiculosService.findOne(dto.IdVehiculoActual);
      if (vehiculo.EstadoOperativo === EstadoOperativo.NoOperativo) {
        throw new BadRequestException(
          `No se puede asignar el vehículo ${vehiculo.Patente} porque está No operativo`,
        );
      }
    }
    return this.prisma.chofer.create({ data: dto, include: CON_VEHICULO });
  }

  async findAll(filtro: FiltroChoferesDto) {
    const choferes = await this.prisma.chofer.findMany({
      where: { Activo: true, EstadoChofer: filtro.EstadoChofer },
      include: CON_VEHICULO,
      orderBy: { Apellido: 'asc' },
    });
    for (const c of choferes) {
      if (c.Viajes && c.Viajes.length > 0 && c.EstadoChofer !== EstadoChofer.EnViaje) {
        c.EstadoChofer = EstadoChofer.EnViaje;
        await this.prisma.chofer.update({
          where: { IdChofer: c.IdChofer },
          data: { EstadoChofer: EstadoChofer.EnViaje },
        });
      }
    }
    return choferes;
  }

  async findOne(id: number) {
    const chofer = await this.prisma.chofer.findFirst({
      where: { IdChofer: id, Activo: true },
      include: CON_VEHICULO,
    });
    if (!chofer) {
      throw new NotFoundException(`No existe un chofer con id ${id}`);
    }
    return chofer;
  }

  async update(id: number, dto: UpdateChoferDto) {
    const chofer = await this.findOne(id);
    const tieneViajesActivos = Boolean(chofer.Viajes && chofer.Viajes.length > 0);
    if (
      dto.EstadoChofer &&
      (chofer.EstadoChofer === EstadoChofer.EnViaje || tieneViajesActivos)
    ) {
      throw new ConflictException(
        'El chofer tiene un viaje asignado: vuelve a estar Libre cuando el viaje se finaliza o se cancela',
      );
    }
    this.validarTurno(
      dto.IngresoTurno ?? chofer.IngresoTurno,
      dto.FinalizacionTurno ?? chofer.FinalizacionTurno,
    );
    return this.prisma.chofer.update({
      where: { IdChofer: id },
      data: dto,
      include: CON_VEHICULO,
    });
  }

  async asignarVehiculo(id: number, dto: AsignarVehiculoDto) {
    const chofer = await this.findOne(id);
    const viajesActivos = await this.prisma.viaje.count({
      where: {
        IdChofer: id,
        Activo: true,
        EstadoViaje: { in: ESTADOS_ACTIVOS },
      },
    });
    if (viajesActivos > 0) {
      throw new ConflictException(
        `No se puede cambiar ni desvincular el vehículo del chofer ${chofer.Nombre} ${chofer.Apellido} porque tiene viajes en curso o pendientes asignados`,
      );
    }

    if (dto.IdVehiculo !== null) {
      const vehiculo = await this.vehiculosService.findOne(dto.IdVehiculo);
      if (vehiculo.EstadoOperativo === EstadoOperativo.NoOperativo) {
        throw new ConflictException(
          `No se puede asignar el vehículo ${vehiculo.Patente} porque está No operativo`,
        );
      }
    }
    return this.prisma.chofer.update({
      where: { IdChofer: id },
      data: { IdVehiculoActual: dto.IdVehiculo },
      include: CON_VEHICULO,
    });
  }

  async remove(id: number) {
    const chofer = await this.findOne(id);
    if (chofer.EstadoChofer === EstadoChofer.EnViaje) {
      throw new ConflictException(
        'No se puede eliminar un chofer que tiene un viaje asignado',
      );
    }
    return this.prisma.chofer.update({
      where: { IdChofer: id },
      data: { Activo: false },
      include: CON_VEHICULO,
    });
  }

  private validarTurno(ingreso: Date, finalizacion: Date) {
    if (finalizacion <= ingreso) {
      throw new BadRequestException(
        'FinalizacionTurno debe ser posterior a IngresoTurno',
      );
    }
  }
}

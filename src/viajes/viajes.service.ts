import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChoferesService } from '../choferes/choferes.service.js';
import { ClientesService } from '../clientes/clientes.service.js';
import { Prisma } from '../generated/prisma/client.js';
import {
  EstadoChofer,
  EstadoDeViaje,
  EstadoOperativo,
} from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { VehiculosService } from '../vehiculos/vehiculos.service.js';
import { AsignarViajeDto } from './dto/asignar-viaje.dto.js';
import { CambiarEstadoViajeDto } from './dto/cambiar-estado-viaje.dto.js';
import { CreateViajeDto } from './dto/create-viaje.dto.js';
import { FiltroViajesDto } from './dto/filtro-viajes.dto.js';
import { UpdateViajeDto } from './dto/update-viaje.dto.js';
import {
  ESTADOS_ACTIVOS,
  ESTADOS_EN_SERVICIO,
  ESTADOS_HISTORICOS,
  TRANSICIONES,
} from './estados-viaje.js';

const INCLUDE_VIAJE = {
  Operador: {
    select: { IdUsuario: true, Nombre: true, Mail: true, Rol: true },
  },
  Cliente: true,
  Chofer: true,
  Vehiculo: true,
} satisfies Prisma.ViajeInclude;

@Injectable()
export class ViajesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuariosService: UsuariosService,
    private readonly clientesService: ClientesService,
    private readonly choferesService: ChoferesService,
    private readonly vehiculosService: VehiculosService,
  ) {}

  async create(dto: CreateViajeDto) {
    await this.usuariosService.findOne(dto.IdOperador);
    await this.clientesService.findOne(dto.IdCliente);
    return this.prisma.viaje.create({ data: dto, include: INCLUDE_VIAJE });
  }

  findAll(filtro: FiltroViajesDto) {
    const condiciones: Prisma.ViajeWhereInput[] = [];
    if (filtro.tipo) {
      const estados =
        filtro.tipo === 'activos' ? ESTADOS_ACTIVOS : ESTADOS_HISTORICOS;
      condiciones.push({ EstadoViaje: { in: estados } });
    }
    if (filtro.EstadoViaje) {
      condiciones.push({ EstadoViaje: filtro.EstadoViaje });
    }
    return this.prisma.viaje.findMany({
      where: {
        Activo: true,
        IdChofer: filtro.IdChofer,
        IdCliente: filtro.IdCliente,
        AND: condiciones,
      },
      include: INCLUDE_VIAJE,
      orderBy: { CreadoEl: 'desc' },
    });
  }

  async findOne(id: number) {
    const viaje = await this.prisma.viaje.findFirst({
      where: { IdViaje: id, Activo: true },
      include: { ...INCLUDE_VIAJE, Extravios: { where: { Activo: true } } },
    });
    if (!viaje) {
      throw new NotFoundException(`No existe un viaje con id ${id}`);
    }
    return viaje;
  }

  async update(id: number, dto: UpdateViajeDto) {
    const viaje = await this.findOne(id);
    if (viaje.EstadoViaje !== EstadoDeViaje.Pendiente) {
      throw new ConflictException(
        `Solo se pueden editar viajes en estado Pendiente (estado actual: ${viaje.EstadoViaje})`,
      );
    }
    if (dto.IdCliente) {
      await this.clientesService.findOne(dto.IdCliente);
    }
    return this.prisma.viaje.update({
      where: { IdViaje: id },
      data: dto,
      include: INCLUDE_VIAJE,
    });
  }

  async asignar(id: number, dto: AsignarViajeDto) {
    const viaje = await this.findOne(id);
    if (viaje.EstadoViaje !== EstadoDeViaje.Pendiente) {
      throw new ConflictException(
        `Solo se pueden asignar viajes en estado Pendiente (estado actual: ${viaje.EstadoViaje})`,
      );
    }

    const chofer = await this.choferesService.findOne(dto.IdChofer);
    if (
      chofer.EstadoChofer === EstadoChofer.FueraDeServicio ||
      chofer.EstadoChofer === EstadoChofer.Vacaciones
    ) {
      throw new ConflictException(
        `El chofer ${chofer.Nombre} ${chofer.Apellido} no puede recibir viajes porque está ${chofer.EstadoChofer === EstadoChofer.Vacaciones ? 'de Vacaciones' : 'Fuera de servicio'}`,
      );
    }

    const idVehiculo = chofer.IdVehiculoActual;
    if (!idVehiculo) {
      throw new BadRequestException(
        `El chofer ${chofer.Nombre} ${chofer.Apellido} no tiene un vehículo asignado: primero asignale un vehículo`,
      );
    }
    const vehiculo = await this.vehiculosService.findOne(idVehiculo);
    if (vehiculo.EstadoOperativo !== EstadoOperativo.Operativo) {
      throw new ConflictException(
        `El vehículo ${vehiculo.Patente} asignado al chofer no está Operativo (estado actual: ${vehiculo.EstadoOperativo})`,
      );
    }
    const vehiculoOcupadoPorOtro = await this.prisma.viaje.findFirst({
      where: {
        IdVehiculo: idVehiculo,
        IdChofer: { not: chofer.IdChofer },
        Activo: true,
        EstadoViaje: { in: ESTADOS_EN_SERVICIO },
      },
    });
    if (vehiculoOcupadoPorOtro) {
      throw new ConflictException(
        `El vehículo ${vehiculo.Patente} ya está en uso por otro chofer en el viaje ${vehiculoOcupadoPorOtro.IdViaje}`,
      );
    }

    const viajesActivosChofer = await this.prisma.viaje.count({
      where: {
        IdChofer: chofer.IdChofer,
        Activo: true,
        EstadoViaje: { in: ESTADOS_ACTIVOS },
        IdViaje: { not: id },
      },
    });

    const maxViajes = chofer.MaxViajes ?? 1;
    if (viajesActivosChofer >= maxViajes) {
      throw new ConflictException(
        `El chofer ${chofer.Nombre} ${chofer.Apellido} ya alcanzó el límite de viajes simultáneos (${viajesActivosChofer}/${maxViajes})`,
      );
    }

    const nuevoEstadoViaje =
      viajesActivosChofer > 0 ? EstadoDeViaje.Pendiente : EstadoDeViaje.Asignado;

    return this.prisma.$transaction(async (tx) => {
      await tx.chofer.update({
        where: { IdChofer: chofer.IdChofer },
        data: { EstadoChofer: EstadoChofer.EnViaje },
      });
      return tx.viaje.update({
        where: { IdViaje: id },
        data: {
          IdChofer: chofer.IdChofer,
          IdVehiculo: idVehiculo,
          EstadoViaje: nuevoEstadoViaje,
        },
        include: INCLUDE_VIAJE,
      });
    });
  }

  async cambiarEstado(id: number, dto: CambiarEstadoViajeDto) {
    const viaje = await this.findOne(id);
    const actual = viaje.EstadoViaje;
    const nuevo = dto.EstadoViaje;

    if (!TRANSICIONES[actual].includes(nuevo)) {
      if (nuevo === EstadoDeViaje.Asignado) {
        throw new ConflictException(
          'Para asignar un viaje usá PATCH /viajes/:id/asignar',
        );
      }
      if (actual === EstadoDeViaje.ViajeFinalizado) {
        // RB-4
        throw new ConflictException(
          'Un viaje finalizado no puede cancelarse ni cambiar de estado',
        );
      }
      const permitidos = TRANSICIONES[actual].join(', ') || 'ninguno';
      throw new ConflictException(
        `No se puede pasar de ${actual} a ${nuevo}. Estados permitidos: ${permitidos}`,
      );
    }

    const enMovimiento: EstadoDeViaje[] = [
      EstadoDeViaje.ChoferEnCamino,
      EstadoDeViaje.EnCurso,
    ];
    if (viaje.IdChofer && enMovimiento.includes(nuevo)) {
      await this.verificarChoferSinOtroViaje(viaje.IdChofer, id, enMovimiento);
    }

    const choferALiberar = ESTADOS_HISTORICOS.includes(nuevo)
      ? viaje.IdChofer
      : null;

    return this.prisma.$transaction(async (tx) => {
      if (choferALiberar !== null) {
        const siguientePendiente = await tx.viaje.findFirst({
          where: {
            IdChofer: choferALiberar,
            EstadoViaje: EstadoDeViaje.Pendiente,
            Activo: true,
            IdViaje: { not: id },
          },
          orderBy: { CreadoEl: 'asc' },
        });

        if (siguientePendiente) {
          await tx.viaje.update({
            where: { IdViaje: siguientePendiente.IdViaje },
            data: { EstadoViaje: EstadoDeViaje.Asignado },
          });
        } else {
          const otrosActivos = await tx.viaje.count({
            where: {
              IdChofer: choferALiberar,
              Activo: true,
              EstadoViaje: { in: ESTADOS_ACTIVOS },
              IdViaje: { not: id },
            },
          });
          if (otrosActivos === 0) {
            await tx.chofer.update({
              where: { IdChofer: choferALiberar },
              data: { EstadoChofer: EstadoChofer.Libre },
            });
          }
        }
      }
      return tx.viaje.update({
        where: { IdViaje: id },
        data: { EstadoViaje: nuevo },
        include: INCLUDE_VIAJE,
      });
    });
  }

  async remove(id: number) {
    const viaje = await this.findOne(id);
    // RB-4
    if (viaje.EstadoViaje === EstadoDeViaje.ViajeFinalizado) {
      throw new ConflictException(
        'Un viaje finalizado no puede eliminarse del historial',
      );
    }
    const choferALiberar = ESTADOS_EN_SERVICIO.includes(viaje.EstadoViaje)
      ? viaje.IdChofer
      : null;

    return this.prisma.$transaction(async (tx) => {
      if (choferALiberar !== null) {
        const siguientePendiente = await tx.viaje.findFirst({
          where: {
            IdChofer: choferALiberar,
            EstadoViaje: EstadoDeViaje.Pendiente,
            Activo: true,
            IdViaje: { not: id },
          },
          orderBy: { CreadoEl: 'asc' },
        });

        if (siguientePendiente) {
          await tx.viaje.update({
            where: { IdViaje: siguientePendiente.IdViaje },
            data: { EstadoViaje: EstadoDeViaje.Asignado },
          });
        } else {
          const otrosActivos = await tx.viaje.count({
            where: {
              IdChofer: choferALiberar,
              Activo: true,
              EstadoViaje: { in: ESTADOS_ACTIVOS },
              IdViaje: { not: id },
            },
          });
          if (otrosActivos === 0) {
            await tx.chofer.update({
              where: { IdChofer: choferALiberar },
              data: { EstadoChofer: EstadoChofer.Libre },
            });
          }
        }
      }
      return tx.viaje.update({
        where: { IdViaje: id },
        data: { Activo: false },
        include: INCLUDE_VIAJE,
      });
    });
  }

  private async verificarChoferSinOtroViaje(
    idChofer: number,
    idViaje: number,
    estados: EstadoDeViaje[],
  ) {
    const otro = await this.prisma.viaje.findFirst({
      where: {
        IdChofer: idChofer,
        IdViaje: { not: idViaje },
        Activo: true,
        EstadoViaje: { in: estados },
      },
    });
    if (otro) {
      throw new ConflictException(
        `El chofer ${idChofer} ya tiene el viaje ${otro.IdViaje} en estado ${otro.EstadoViaje}: debe finalizarlo o cancelarlo antes`,
      );
    }
  }
}

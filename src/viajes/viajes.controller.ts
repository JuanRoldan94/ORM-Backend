import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MaintenanceScope } from '../maintenance/maintenance.decorator.js';
import { AsignarViajeDto } from './dto/asignar-viaje.dto.js';
import { CambiarEstadoViajeDto } from './dto/cambiar-estado-viaje.dto.js';
import { CreateViajeDto } from './dto/create-viaje.dto.js';
import { FiltroViajesDto } from './dto/filtro-viajes.dto.js';
import { UpdateViajeDto } from './dto/update-viaje.dto.js';
import { ViajesService } from './viajes.service.js';

@MaintenanceScope('VIAJES')
@Controller('viajes')
export class ViajesController {
  constructor(private readonly viajesService: ViajesService) {}

  @Post()
  create(@Body() dto: CreateViajeDto) {
    return this.viajesService.create(dto);
  }

  @Get()
  findAll(@Query() filtro: FiltroViajesDto) {
    return this.viajesService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.viajesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateViajeDto) {
    return this.viajesService.update(id, dto);
  }

  @Patch(':id/asignar')
  asignar(@Param('id', ParseIntPipe) id: number, @Body() dto: AsignarViajeDto) {
    return this.viajesService.asignar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoViajeDto,
  ) {
    return this.viajesService.cambiarEstado(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.viajesService.remove(id);
  }
}

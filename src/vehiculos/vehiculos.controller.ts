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
import { CreateVehiculoDto } from './dto/create-vehiculo.dto.js';
import { FiltroVehiculosDto } from './dto/filtro-vehiculos.dto.js';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto.js';
import { VehiculosService } from './vehiculos.service.js';

@MaintenanceScope('VEHICULOS')
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  create(@Body() dto: CreateVehiculoDto) {
    return this.vehiculosService.create(dto);
  }

  @Get()
  findAll(@Query() filtro: FiltroVehiculosDto) {
    return this.vehiculosService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVehiculoDto,
  ) {
    return this.vehiculosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.remove(id);
  }
}

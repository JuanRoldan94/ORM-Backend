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
import { ChoferesService } from './choferes.service.js';
import { AsignarVehiculoDto } from './dto/asignar-vehiculo.dto.js';
import { CreateChoferDto } from './dto/create-chofer.dto.js';
import { FiltroChoferesDto } from './dto/filtro-choferes.dto.js';
import { UpdateChoferDto } from './dto/update-chofer.dto.js';

@Controller('choferes')
export class ChoferesController {
  constructor(private readonly choferesService: ChoferesService) {}

  @Post()
  create(@Body() dto: CreateChoferDto) {
    return this.choferesService.create(dto);
  }

  @Get()
  findAll(@Query() filtro: FiltroChoferesDto) {
    return this.choferesService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.choferesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateChoferDto) {
    return this.choferesService.update(id, dto);
  }

  @Patch(':id/vehiculo')
  asignarVehiculo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarVehiculoDto,
  ) {
    return this.choferesService.asignarVehiculo(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.choferesService.remove(id);
  }
}

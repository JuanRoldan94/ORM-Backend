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
import { CreateExtravioDto } from './dto/create-extravio.dto.js';
import { FiltroExtraviosDto } from './dto/filtro-extravios.dto.js';
import { UpdateExtravioDto } from './dto/update-extravio.dto.js';
import { ExtraviosService } from './extravios.service.js';

@Controller('extravios')
export class ExtraviosController {
  constructor(private readonly extraviosService: ExtraviosService) {}

  @Post()
  create(@Body() dto: CreateExtravioDto) {
    return this.extraviosService.create(dto);
  }

  @Get()
  findAll(@Query() filtro: FiltroExtraviosDto) {
    return this.extraviosService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.extraviosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExtravioDto,
  ) {
    return this.extraviosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.extraviosService.remove(id);
  }
}

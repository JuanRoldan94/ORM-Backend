import { Module } from '@nestjs/common';
import { VehiculosModule } from '../vehiculos/vehiculos.module.js';
import { ChoferesController } from './choferes.controller.js';
import { ChoferesService } from './choferes.service.js';

@Module({
  imports: [VehiculosModule],
  controllers: [ChoferesController],
  providers: [ChoferesService],
  exports: [ChoferesService],
})
export class ChoferesModule {}

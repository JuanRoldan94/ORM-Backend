import { Module } from '@nestjs/common';
import { ViajesModule } from '../viajes/viajes.module.js';
import { ExtraviosController } from './extravios.controller.js';
import { ExtraviosService } from './extravios.service.js';

@Module({
  imports: [ViajesModule],
  controllers: [ExtraviosController],
  providers: [ExtraviosService],
})
export class ExtraviosModule {}

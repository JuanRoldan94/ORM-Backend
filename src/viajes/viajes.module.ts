import { Module } from '@nestjs/common';
import { ChoferesModule } from '../choferes/choferes.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { VehiculosModule } from '../vehiculos/vehiculos.module.js';
import { ViajesController } from './viajes.controller.js';
import { ViajesService } from './viajes.service.js';

@Module({
  imports: [UsuariosModule, ClientesModule, ChoferesModule, VehiculosModule],
  controllers: [ViajesController],
  providers: [ViajesService],
  exports: [ViajesService],
})
export class ViajesModule {}

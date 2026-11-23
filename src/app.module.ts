import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ChoferesModule } from './choferes/choferes.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { ExtraviosModule } from './extravios/extravios.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { VehiculosModule } from './vehiculos/vehiculos.module.js';
import { ViajesModule } from './viajes/viajes.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'orm-backend',
    }),
    PrismaModule,
    UsuariosModule,
    VehiculosModule,
    ChoferesModule,
    ClientesModule,
    ViajesModule,
    ExtraviosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

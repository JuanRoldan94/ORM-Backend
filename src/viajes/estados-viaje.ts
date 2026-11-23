import { EstadoDeViaje } from '../generated/prisma/enums.js';

// Viajes "activos" del RF-3: todavía no terminaron.
export const ESTADOS_ACTIVOS: EstadoDeViaje[] = [
  EstadoDeViaje.Pendiente,
  EstadoDeViaje.Asignado,
  EstadoDeViaje.ChoferEnCamino,
  EstadoDeViaje.EnCurso,
];

// Viajes "históricos" del RF-3: ya terminaron.
export const ESTADOS_HISTORICOS: EstadoDeViaje[] = [
  EstadoDeViaje.ViajeFinalizado,
  EstadoDeViaje.CanceladoPorElCliente,
  EstadoDeViaje.CanceladoPorElChofer,
];

// Estados en los que el chofer y el vehículo están ocupados con el viaje.
export const ESTADOS_EN_SERVICIO: EstadoDeViaje[] = [
  EstadoDeViaje.Asignado,
  EstadoDeViaje.ChoferEnCamino,
  EstadoDeViaje.EnCurso,
];

// Cambios de estado permitidos (sección 5.3). Pendiente → Asignado se hace con
// PATCH /viajes/:id/asignar. Desde los estados finales no se puede salir (RB-4).
export const TRANSICIONES: Record<EstadoDeViaje, EstadoDeViaje[]> = {
  Pendiente: [EstadoDeViaje.CanceladoPorElCliente],
  Asignado: [
    EstadoDeViaje.ChoferEnCamino,
    EstadoDeViaje.CanceladoPorElCliente,
    EstadoDeViaje.CanceladoPorElChofer,
  ],
  ChoferEnCamino: [
    EstadoDeViaje.EnCurso,
    EstadoDeViaje.CanceladoPorElCliente,
    EstadoDeViaje.CanceladoPorElChofer,
  ],
  EnCurso: [
    EstadoDeViaje.ViajeFinalizado,
    EstadoDeViaje.CanceladoPorElCliente,
    EstadoDeViaje.CanceladoPorElChofer,
  ],
  ViajeFinalizado: [],
  CanceladoPorElCliente: [],
  CanceladoPorElChofer: [],
};

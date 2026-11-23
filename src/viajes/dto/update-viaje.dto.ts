import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateViajeDto } from './create-viaje.dto.js';

// RF-3: solo se edita la información del viaje mientras está Pendiente.
// El estado, el chofer y el vehículo se cambian con /estado y /asignar.
export class UpdateViajeDto extends PartialType(
  OmitType(CreateViajeDto, ['IdOperador'] as const),
) {}

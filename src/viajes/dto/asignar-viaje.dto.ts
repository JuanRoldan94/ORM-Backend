import { IsInt, IsOptional, Min } from 'class-validator';

// RF-5: asignar el viaje a un chofer. El vehículo se toma automáticamente
// del vehículo actual que tiene asignado el chofer en el momento.
export class AsignarViajeDto {
  @IsInt()
  @Min(1)
  IdChofer: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  IdVehiculo?: number;
}

import { IsInt, Min, ValidateIf } from 'class-validator';

// RF-4: asignar un vehículo a un chofer. Con null se le quita el vehículo.
export class AsignarVehiculoDto {
  @ValidateIf((_, valor) => valor !== null)
  @IsInt()
  @Min(1)
  IdVehiculo: number | null;
}

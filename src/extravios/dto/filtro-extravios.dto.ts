import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class FiltroExtraviosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  IdViaje?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  IdCliente?: number;
}

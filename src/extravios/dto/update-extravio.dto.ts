import { PartialType } from '@nestjs/mapped-types';
import { CreateExtravioDto } from './create-extravio.dto.js';

export class UpdateExtravioDto extends PartialType(CreateExtravioDto) {}

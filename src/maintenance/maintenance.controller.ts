import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
} from '@nestjs/common';
import { Roles } from '../generated/prisma/enums.js';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto.js';
import { MaintenanceService } from './maintenance.service.js';

@Controller()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // GET /system/maintenance-status (público)
  @Get('system/maintenance-status')
  async getStatus() {
    const checkGlobal = await this.maintenanceService.checkMaintenance('GLOBAL');
    const activeScopes = await this.maintenanceService.getActiveScopes();
    const allScopes = await this.maintenanceService.getAllScopes();

    return {
      global: {
        isActive: checkGlobal.blocked && checkGlobal.scope === 'GLOBAL',
        message: checkGlobal.message,
      },
      activeScopes,
      allScopes,
    };
  }

  // PATCH /admin/maintenance/:scope (protegido para administradores)
  @Patch('admin/maintenance/:scope')
  async updateScope(
    @Param('scope') scope: string,
    @Body() dto: UpdateMaintenanceDto,
    @Headers('x-user-role') role?: string,
  ) {
    if (
      role !== Roles.Duenio &&
      role !== Roles.Administrador &&
      role !== 'Duenio' &&
      role !== 'Administrador' &&
      role !== 'Dueño'
    ) {
      throw new ForbiddenException(
        'Solo los usuarios con rol Dueño o Administrador pueden configurar el modo mantenimiento',
      );
    }

    return this.maintenanceService.updateScope(
      scope.toUpperCase(),
      dto.isActive,
      dto.message,
    );
  }
}

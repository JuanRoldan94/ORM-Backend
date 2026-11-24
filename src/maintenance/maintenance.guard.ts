import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Roles } from '../generated/prisma/enums.js';
import { MAINTENANCE_SCOPE_KEY } from './maintenance.decorator.js';
import { MaintenanceService } from './maintenance.service.js';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const path = req.path || req.url || '';

    // Reglas críticas de exclusión (evitar autobloqueo estricto):
    // 1. Endpoints de status y administración de mantenimiento, auth y consulta de usuarios para inicio de sesión
    if (
      path.startsWith('/system/maintenance-status') ||
      path.startsWith('/admin/maintenance') ||
      path.startsWith('/health') ||
      path.startsWith('/auth') ||
      (req.method === 'GET' && path === '/usuarios')
    ) {
      return true;
    }

    // 2. Bypass para Administradores y Dueños
    // Verifica encabezado provisorio o payload de usuario
    const userRoleHeader = req.headers['x-user-role'] as string | undefined;
    const reqUser = (req as unknown as { user?: { Rol?: string } }).user;
    const effectiveRole = reqUser?.Rol ?? userRoleHeader;

    if (
      effectiveRole === Roles.Duenio ||
      effectiveRole === Roles.Administrador ||
      effectiveRole === 'Duenio' ||
      effectiveRole === 'Administrador' ||
      effectiveRole === 'Dueño'
    ) {
      return true;
    }

    // 3. Obtener el scope configurado a nivel de método o controlador
    const scope =
      this.reflector.get<string>(MAINTENANCE_SCOPE_KEY, context.getHandler()) ??
      this.reflector.get<string>(MAINTENANCE_SCOPE_KEY, context.getClass());

    // 4. Chequear mantenimiento (GLOBAL o scope específico)
    const check = await this.maintenanceService.checkMaintenance(scope);

    if (check.blocked) {
      // Header Retry-After requerido
      res.setHeader('Retry-After', '300');

      throw new HttpException(
        {
          code: 'MAINTENANCE_MODE',
          scope: check.scope ?? 'GLOBAL',
          message: check.message ?? 'Estamos realizando tareas de mantenimiento.',
        },
        HttpStatus.SERVICE_UNAVAILABLE, // 503
      );
    }

    return true;
  }
}

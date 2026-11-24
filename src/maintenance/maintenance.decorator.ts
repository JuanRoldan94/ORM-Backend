import { SetMetadata } from '@nestjs/common';

export const MAINTENANCE_SCOPE_KEY = 'maintenance_scope';
export const MaintenanceScope = (scope: string) =>
  SetMetadata(MAINTENANCE_SCOPE_KEY, scope);

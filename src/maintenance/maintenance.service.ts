import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ScopeStatus {
  scope: string;
  isActive: boolean;
  message: string;
}

export interface CheckResult {
  blocked: boolean;
  scope?: string;
  message?: string;
}

interface CacheState {
  loadedAt: number;
  data: Map<string, ScopeStatus>;
}

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);
  private cache: CacheState | null = null;
  private readonly TTL_MS = 60_000; // 60 segundos de TTL de seguridad

  constructor(private readonly prisma: PrismaService) {}

  private async getOrLoadScopes(): Promise<Map<string, ScopeStatus>> {
    const now = Date.now();
    if (this.cache && now - this.cache.loadedAt < this.TTL_MS) {
      return this.cache.data;
    }

    try {
      const records = await this.prisma.maintenanceScope.findMany();
      const map = new Map<string, ScopeStatus>();
      for (const r of records) {
        map.set(r.scope, {
          scope: r.scope,
          isActive: r.isActive,
          message: r.message,
        });
      }
      this.cache = { loadedAt: now, data: map };
      return map;
    } catch (error) {
      this.logger.error('Error al cargar scopes de mantenimiento desde BD', error);
      // Si la BD falla y hay caché vieja, usarla para resiliencia
      if (this.cache) return this.cache.data;
      return new Map();
    }
  }

  async checkMaintenance(scope?: string): Promise<CheckResult> {
    const scopes = await this.getOrLoadScopes();

    // 1. Revisar siempre primero si 'GLOBAL' está activo
    const globalStatus = scopes.get('GLOBAL');
    if (globalStatus && globalStatus.isActive) {
      return {
        blocked: true,
        scope: 'GLOBAL',
        message: globalStatus.message,
      };
    }

    // 2. Si no es global, revisar el scope específico solicitado
    if (scope) {
      const specificStatus = scopes.get(scope);
      if (specificStatus && specificStatus.isActive) {
        return {
          blocked: true,
          scope,
          message: specificStatus.message,
        };
      }
    }

    return { blocked: false };
  }

  async getActiveScopes(): Promise<Record<string, { isActive: boolean; message: string }>> {
    const scopes = await this.getOrLoadScopes();
    const result: Record<string, { isActive: boolean; message: string }> = {};
    for (const [key, value] of scopes.entries()) {
      if (value.isActive) {
        result[key] = { isActive: true, message: value.message };
      }
    }
    return result;
  }

  async getAllScopes(): Promise<ScopeStatus[]> {
    const scopes = await this.getOrLoadScopes();
    return Array.from(scopes.values());
  }

  async updateScope(
    scope: string,
    isActive: boolean,
    message?: string,
  ): Promise<ScopeStatus> {
    const updated = await this.prisma.maintenanceScope.upsert({
      where: { scope },
      create: {
        scope,
        isActive,
        message: message ?? 'Estamos realizando tareas de mantenimiento.',
      },
      update: {
        isActive,
        ...(message !== undefined ? { message } : {}),
      },
    });

    // Invalidar inmediatamente la caché
    this.invalidateCache();

    return {
      scope: updated.scope,
      isActive: updated.isActive,
      message: updated.message,
    };
  }

  invalidateCache(): void {
    this.cache = null;
    this.logger.log('Caché de mantenimiento invalidada');
  }
}

import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client.js';

// Traduce los errores de Prisma más comunes a respuestas HTTP con sentido.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (error.code) {
      case 'P2002': {
        // En MySQL, meta.target es el nombre del índice, p. ej. "Usuario_Mail_key"
        const target = error.meta?.target;
        const campo = Array.isArray(target)
          ? target.join(', ')
          : typeof target === 'string'
            ? target.replace(/^[^_]+_/, '').replace(/_key$/, '')
            : 'valor';
        return super.catch(
          new ConflictException(`Ya existe un registro con ese ${campo}`),
          host,
        );
      }
      case 'P2003':
        return super.catch(
          new BadRequestException(
            'Se hace referencia a un registro que no existe',
          ),
          host,
        );
      case 'P2025':
        return super.catch(
          new NotFoundException('Registro no encontrado'),
          host,
        );
      default:
        return super.catch(error, host);
    }
  }
}

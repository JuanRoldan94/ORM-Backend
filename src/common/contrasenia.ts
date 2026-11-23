import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  contrasenia: string,
  salt: Buffer,
  largo: number,
) => Promise<Buffer>;

// Se guarda como "salt:hash" (hex). Nunca se guarda la contraseña en texto plano.
export async function hashContrasenia(contrasenia: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(contrasenia, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

// Para usar en el login (RF-2).
export async function verificarContrasenia(
  contrasenia: string,
  guardada: string,
): Promise<boolean> {
  const [salt, hash] = guardada.split(':');
  if (!salt || !hash) return false;
  const calculado = await scryptAsync(
    contrasenia,
    Buffer.from(salt, 'hex'),
    64,
  );
  return timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}

import * as crypto from 'crypto';

export function gerarCodigoReserva(): string {
  return crypto.randomBytes(4).toString('hex'); // ex: a3f9c2d1
}

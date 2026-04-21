import argon2 from 'argon2';
import { compare as compareBcrypt } from 'bcryptjs';

export const minimumPasswordLength = 8;

const argon2Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export function hasMinimumPasswordLength(password: string) {
  return password.length >= minimumPasswordLength;
}

export function hashPassword(password: string) {
  return argon2.hash(password, argon2Options);
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (passwordHash.startsWith('$argon2')) {
    return argon2.verify(passwordHash, password);
  }

  if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2y$')) {
    return compareBcrypt(password, passwordHash);
  }

  return false;
}

export function needsPasswordRehash(passwordHash: string) {
  return !passwordHash.startsWith('$argon2id$');
}

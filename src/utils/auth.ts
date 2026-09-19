import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

const bcryptApi = bcrypt as {
  hash: (password: string, saltOrRounds: number | string) => Promise<string>;
  compare: (password: string, hashedPassword: string) => Promise<boolean>;
};

export async function hashPassword(password: string): Promise<string> {
  return bcryptApi.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcryptApi.compare(password, hashedPassword);
}

export class CreateAuthDto {}

export type GoogleUserDTO = {
  googleId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}
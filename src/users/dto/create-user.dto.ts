/* eslint-disable */
import { Role, Class } from '@prisma/client';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
  class: Class;
}

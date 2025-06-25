/* eslint-disable */
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  IsArray,
  ArrayNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { Role, Class } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;


  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @ValidateIf(o => o.role === 'TEACHER' || o.role === 'STUDENT')
  @IsArray()
  @IsEnum(Class, { each: true })
  @ArrayNotEmpty({
    message: (validationArguments) => {
      const role = validationArguments.object['role'];
      return role === 'TEACHER'
        ? 'Teacher must belong to at least one class'
        : 'Student must belong to exactly one class';
    }
  })
  @ArrayMaxSize(1, {
    message: 'Student must belong to only one class',
    groups: ['STUDENT']
  })
  class?: Class[];

  // Explicitly prevent class for ADMIN/PARENT
  validate() {
    if ((this.role === 'ADMIN' || this.role === 'PARENT') && this.class) {
      throw new Error('ADMIN and PARENT roles should not have class assignments');
    }
  }
}
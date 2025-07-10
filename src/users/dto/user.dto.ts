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
  validateOrReject,
  IsJWT,
  MinLength,
} from 'class-validator';
import { Role, Class } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  
  @ApiProperty({
    example: 'Example',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;
    @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'user@example.com',
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
  })

  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'TEACHER',
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    example: ['S1', 'S2'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Class, { each: true })
  class?: Class[];
}

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    required: false,
    description: 'Either email or phone must be provided'
  })
  @ValidateIf(o => !o.phone)
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: '+1234567890',
  })
  @ValidateIf(o => !o.email)
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
export class ForgotPasswordDto {
   @ApiProperty({
    example: 'example@mail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

   @ApiProperty({
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone: string;
}
export class ResetPasswordDto {
   @ApiProperty({
  })
  @IsJWT()
  token: string;

   @ApiProperty({
    example: 'Example@123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
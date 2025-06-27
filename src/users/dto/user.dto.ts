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
  validateOrReject
} from 'class-validator';
import { Role, Class } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  
  @ApiProperty({
    example: 'Example',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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

export class LoginUserDto{
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


}
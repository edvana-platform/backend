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
  IsDateString
} from 'class-validator';
import { Role, Class, Gender } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'MALE' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '2005-09-15' })
  @IsDateString()
  dob: Date;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0780000000' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'STUDENT' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'Kigali' })
  @IsOptional()
  address: string;

  @ApiProperty({ example: 'ST12345' })
  @IsOptional()
  studentId?: string;

  @ApiProperty({ example: ['S1'], required: false })
  @IsOptional()
  @IsArray()
  class?: Class[];

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @IsString()
  studentStream?: string;

  @ApiProperty({ example: 'Green Valley School', required: false })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiProperty({ example: '0788888888', required: false })
  @IsOptional()
  @IsString()
  parentPhone?: string;
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
    example: 'mail@mail.co',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '11111',
  })
  @IsString()
  otp: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsString()
  newPassword: string;
}
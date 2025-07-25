/* eslint-disable */
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchoolDto {
    @ApiProperty({
    example: 'Green Hills Academy',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

    @ApiProperty({
    example: 'greenhills@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

    @ApiProperty({
    example: '0788504922',
  })
  @IsOptional()
  @IsString()
  phone?: string;

    @ApiProperty({
    example: 'Kigali',
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateSchoolDto {
    @ApiProperty({
    example: 'RCA',
  })
  @IsOptional()
  @IsString()
  name?: string;

    @ApiProperty({
    example: 'exampl@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

    @ApiProperty({
    example: '0788321244',
  })
  @IsOptional()
  @IsString()
  phone?: string;

    @ApiProperty({
    example: 'Gisenyi',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
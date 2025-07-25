/* eslint-disable */
import { IsString, IsUUID, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSchoolDto {
    @ApiProperty({
    example: 'user UUID',
  })
  @IsUUID()
  userId: string;

    @ApiProperty({
    example: 'school UUID',
  })
  @IsUUID()
  schoolId: string;

    @ApiProperty({
    example: 'STUDENT',
  })
  @IsEnum(Role, { message: 'Role must be STUDENT or TEACHER' })
  role: Role;
}

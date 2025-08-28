import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({ example: 'Primary' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateGradeDto {
  @ApiProperty({ example: 'P1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'level-id-here' })
  @IsString()
  @IsNotEmpty()
  levelId: string;
}

export class CreateSubgradeDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'grade-id-here' })
  @IsString()
  @IsNotEmpty()
  gradeId: string;
}

export class CreateClassDto {
  @ApiProperty({ example: 'grade-id-here' })
  @IsString()
  @IsNotEmpty()
  gradeId: string;

  @ApiProperty({ example: 'subgrade-id-here', required: false })
  @IsOptional()
  @IsString()
  subgradeId?: string;
}

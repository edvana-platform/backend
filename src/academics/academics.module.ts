import { Module } from '@nestjs/common';
import { AcademicService } from './academics.service';
import { AcademicController } from './academics.controller';
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule], 
  controllers: [AcademicController],
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicsModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService, PrismaService],
  exports:[ResourcesService]
})
export class ResourcesModule {}


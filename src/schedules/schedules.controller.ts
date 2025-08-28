// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Query,
//   UseGuards
// } from '@nestjs/common';
// import { ApiTags, ApiQuery, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// import { SchedulesService } from './schedules.service';
// import {
//   CreateScheduleDto,
//   UpdateScheduleDto,
//   QueryScheduleDto,
//   SchoolClass,
// } from './dto/schedule.dtos';

// import { RolesGuard } from '../auth/roles.guard';

// @ApiTags('Schedules')
// @ApiBearerAuth('access-token')
// @UseGuards(RolesGuard)
// @Controller('schedules')
// export class SchedulesController {
//   constructor(private readonly schedulesService: SchedulesService) {}

//   // ---------- CREATE ----------
//   @Post()
//   @ApiOperation({ summary: 'Create a schedule event' })
//   create(@Body() dto: CreateScheduleDto) {
//     return this.schedulesService.create(dto);
//   }

//   // ---------- LIST / FILTER ----------
//   @Get()
//   @ApiOperation({ summary: 'List schedule events with filters' })
//   @ApiQuery({ name: 'from', required: false, description: 'Inclusive UTC start (ISO)' })
//   @ApiQuery({ name: 'to', required: false, description: 'Exclusive UTC end (ISO)' })
//   @ApiQuery({ name: 'day', required: false, description: 'Limit to a particular day (ISO)' })
//   @ApiQuery({ name: 'subjectId', required: false })
//   @ApiQuery({ name: 'createdById', required: false })
//   @ApiQuery({ name: 'audience', required: false, enum: ['PUBLIC','STUDENTS','TEACHERS','CLASS_ONLY','PRIVATE'] })
//   @ApiQuery({ name: 'targetClass', required: false, enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'] })
//   @ApiQuery({ name: 'viewerId', required: false })
//   @ApiQuery({ name: 'viewerClass', required: false, enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'] })
//   @ApiQuery({ name: 'q', required: false, description: 'Free-text search' })
//   findAll(@Query() q: QueryScheduleDto) {
//     return this.schedulesService.findAll(q);
//   }

//   // ---------- CALENDAR GRID (grouped by weekday) ----------
//   @Get('calendar')
//   @ApiOperation({ summary: 'Calendar view grouped by weekday' })
//   @ApiQuery({ name: 'from', required: false })
//   @ApiQuery({ name: 'to', required: false })
//   @ApiQuery({ name: 'day', required: false })
//   @ApiQuery({ name: 'subjectId', required: false })
//   @ApiQuery({ name: 'createdById', required: false })
//   @ApiQuery({ name: 'audience', required: false, enum: ['PUBLIC','STUDENTS','TEACHERS','CLASS_ONLY','PRIVATE'] })
//   @ApiQuery({ name: 'targetClass', required: false, enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'] })
//   @ApiQuery({ name: 'viewerId', required: false })
//   @ApiQuery({ name: 'viewerClass', required: false, enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'] })
//   @ApiQuery({ name: 'q', required: false })
//   calendar(@Query() q: QueryScheduleDto) {
//     return this.schedulesService.calendarGrid(q);
//   }

//   // ---------- READ ONE ----------
//   @Get(':id')
//   @ApiOperation({ summary: 'Get a single schedule event' })
//   @ApiQuery({ name: 'viewerId', required: false })
//   @ApiQuery({ name: 'viewerClass', required: false, enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'] })
//   findOne(
//     @Param('id') id: string,
//     @Query('viewerId') viewerId?: string,
//     @Query('viewerClass') viewerClass?: SchoolClass,
//   ) {
//     return this.schedulesService.findOne(id, viewerId, viewerClass);
//   }

//   // ---------- UPDATE ----------
//   @Patch(':id')
//   @ApiOperation({ summary: 'Update a schedule event' })
//   update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
//     return this.schedulesService.update(id, dto);
//   }

//   // ---------- DELETE ----------
//   @Delete(':id')
//   @ApiOperation({ summary: 'Delete a schedule event' })
//   remove(@Param('id') id: string) {
//     return this.schedulesService.remove(id);
//   }
// }

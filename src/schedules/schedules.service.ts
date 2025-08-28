// import {
//   Injectable,
//   ForbiddenException,
//   NotFoundException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { Prisma, $Enums, Class as PrismaClass, ScheduleEvent } from '@prisma/client'; // import Prisma types
// import {
//   CreateScheduleDto,
//   UpdateScheduleDto,
//   QueryScheduleDto,
//   ScheduleAudience,
//   SchoolClass,
// } from './dto/schedule.dtos'; // your DTOs import

// @Injectable()
// export class SchedulesService {
//   constructor(private readonly prisma: PrismaService) {}

//   // ---------- CREATE ----------
//   async create(dto: CreateScheduleDto) {
//     this.ensureTimeOrder(dto.startsAt, dto.endsAt);

//     return this.prisma.scheduleEvent.create({
//       data: {
//         title: dto.title,
//         description: dto.description,
//         location: dto.location,
//         audience: dto.audience,
//         startsAt: new Date(dto.startsAt),
//         endsAt: new Date(dto.endsAt),
//         createdById: dto.createdById,
//         subjectId: dto.subjectId,
//         targetClass: dto.targetClass as any, // Prisma enum
//         teacherName: dto.teacherName,
//         subjectName: dto.subjectName ?? dto.title,
//       },
//     });
//   }

//   // ---------- READ ALL ----------
//   async findAll(q: QueryScheduleDto) {
//     const where = this.buildWhere(q);

//     let items = await this.prisma.scheduleEvent.findMany({
//       where,
//       orderBy: [{ startsAt: 'asc' }, { title: 'asc' }],
//     });

//     // enforce visibility if viewer context provided
//     if (q.viewerId || q.viewerClass) {
//       items = await this.filterByVisibility(items, q.viewerId, q.viewerClass);
//     }

//     return items;
//   }

//   // ---------- READ ONE ----------
//   async findOne(id: string, viewerId?: string, viewerClass?: SchoolClass) {
//     const ev = await this.prisma.scheduleEvent.findUnique({ where: { id } });
//     if (!ev) throw new NotFoundException('Schedule not found');

//     if (viewerId || viewerClass) {
//       const ok = await this.canView(ev, viewerId, viewerClass);
//       if (!ok) throw new ForbiddenException('You cannot view this schedule');
//     }

//     return ev;
//   }

//   // ---------- UPDATE ----------
//   async update(id: string, dto: UpdateScheduleDto) {
//     if (dto.startsAt && dto.endsAt) {
//       this.ensureTimeOrder(dto.startsAt, dto.endsAt);
//     }

//     return this.prisma.scheduleEvent.update({
//       where: { id },
//       data: {
//         ...(dto.title !== undefined ? { title: dto.title } : {}),
//         ...(dto.description !== undefined ? { description: dto.description } : {}),
//         ...(dto.location !== undefined ? { location: dto.location } : {}),
//         ...(dto.audience !== undefined ? { audience: dto.audience } : {}),
//         ...(dto.startsAt ? { startsAt: new Date(dto.startsAt) } : {}),
//         ...(dto.endsAt ? { endsAt: new Date(dto.endsAt) } : {}),
//         ...(dto.createdById ? { createdById: dto.createdById } : {}),
//         ...(dto.subjectId !== undefined ? { subjectId: dto.subjectId } : {}),
//         ...(dto.targetClass !== undefined ? { targetClass: dto.targetClass as any } : {}),
//         ...(dto.teacherName !== undefined ? { teacherName: dto.teacherName } : {}),
//         ...(dto.subjectName !== undefined ? { subjectName: dto.subjectName } : {}),
//       },
//     });
//   }

//   // ---------- DELETE ----------
//   async remove(id: string) {
//     return this.prisma.scheduleEvent.delete({ where: { id } });
//   }

//   // ---------- CALENDAR GRID ----------
//   async calendarGrid(q: QueryScheduleDto) {
//     const where = this.buildWhere(q);

//     let items = await this.prisma.scheduleEvent.findMany({
//       where,
//       orderBy: [{ startsAt: 'asc' }, { title: 'asc' }],
//     });

//     if (q.viewerId || q.viewerClass) {
//       items = await this.filterByVisibility(items, q.viewerId, q.viewerClass);
//     }

//     const byDay: Record<string, any[]> = {};
//     for (const ev of items) {
//       const weekday = new Intl.DateTimeFormat('en-US', {
//         weekday: 'long',
//         timeZone: 'UTC',
//       }).format(ev.startsAt);

//       const durationMin = Math.max(
//         0,
//         Math.round((+ev.endsAt - +ev.startsAt) / 60000),
//       );

//       const slot = {
//         id: ev.id,
//         title: ev.title,
//         subjectName: ev.subjectName ?? ev.title,
//         teacherName: ev.teacherName ?? null,
//         location: ev.location ?? null,
//         subjectId: ev.subjectId ?? null,
//         targetClass: ev.targetClass ?? null,
//         startsAt: ev.startsAt,
//         endsAt: ev.endsAt,
//         durationMin,
//       };

//       byDay[weekday] = byDay[weekday] ? [...byDay[weekday], slot] : [slot];
//     }

//     Object.keys(byDay).forEach((k) =>
//       byDay[k].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
//     );

//     return byDay;
//   }

//   // ---------- HELPERS ----------
//   private ensureTimeOrder(startsAtISO: string, endsAtISO: string) {
//     const s = new Date(startsAtISO).getTime();
//     const e = new Date(endsAtISO).getTime();
//     if (isNaN(s) || isNaN(e) || e <= s) {
//       throw new ForbiddenException('endsAt must be after startsAt');
//     }
//   }

//   private buildWhere(q: QueryScheduleDto): Prisma.ScheduleEventWhereInput {
//     let dayStart: Date | undefined;
//     let dayEnd: Date | undefined;
//     if (q.day) {
//       const d = new Date(q.day);
//       dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
//       dayEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0));
//     }

//     return {
//       AND: [
//         q.from ? { startsAt: { gte: new Date(q.from) } } : {},
//         q.to ? { endsAt: { lt: new Date(q.to) } } : {},
//         dayStart ? { startsAt: { gte: dayStart } } : {},
//         dayEnd ? { startsAt: { lt: dayEnd } } : {},
//         q.subjectId ? { subjectId: q.subjectId } : {},
//         q.createdById ? { createdById: q.createdById } : {},
//         q.audience ? { audience: q.audience } : {},
//         q.targetClass ? { targetClass: q.targetClass as any } : {},
//         q.q
//           ? {
//               OR: [
//                 { title: { contains: q.q, mode: 'insensitive' } },
//                 { subjectName: { contains: q.q, mode: 'insensitive' } },
//                 { teacherName: { contains: q.q, mode: 'insensitive' } },
//                 { location: { contains: q.q, mode: 'insensitive' } },
//               ],
//             }
//           : {},
//       ],
//     };
//   }

//   private async filterByVisibility(
//     items: ScheduleEvent[],
//     viewerId?: string,
//     viewerClass?: SchoolClass,
//   ) {
//     return items.filter((ev) => this.canView(ev, viewerId, viewerClass));
//   }

//   private canView(
//     ev: Pick<ScheduleEvent, 'audience' | 'createdById' | 'targetClass'>,
//     viewerId?: string,
//     viewerClass?: SchoolClass,
//   ): boolean {
//     switch (ev.audience) {
//       case 'PRIVATE':
//         return ev.createdById === viewerId;
//       case 'CLASS_ONLY':
//         return !!ev.targetClass && ev.targetClass === viewerClass;
//       case 'STUDENTS':
//       case 'TEACHERS':
//         // TODO: enforce by User.role if needed
//         return true;
//       case 'PUBLIC':
//       default:
//         return true;
//     }
//   }
// }

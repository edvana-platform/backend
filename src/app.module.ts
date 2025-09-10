/* eslint-disable */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ import this
import { AuthMiddleware } from './auth/auth.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './school/schools.module';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './common/email/email.module';
import { AcademicsModule } from './academics/academics.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ResourcesModule } from './resources/resources.module';
// import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    UsersModule,
    AuthModule,
    SchoolsModule,
    RedisModule,
    EmailModule,
    AcademicsModule,
    SubjectsModule,
    ResourcesModule
    // SchedulesModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/forgot-password', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.POST },
        { path: 'schools', method: RequestMethod.POST },
        { path: 'schools', method: RequestMethod.GET },
        { path: 'auth/logout', method: RequestMethod.POST}
      )
      .forRoutes('*');
  }
}

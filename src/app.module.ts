/* eslint-disable */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from './auth/auth.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './school/schools.module';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './common/email/email.module';

@Module({
  imports: [UsersModule, AuthModule, SchoolsModule, RedisModule, EmailModule], 
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
      )
      .forRoutes('*');
  }
}
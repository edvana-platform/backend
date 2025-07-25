/* eslint-disable */
import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL!, {
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
});
  }

  async set(key: string, value: string, ttl: number) {
    return this.client.set(key, value, 'EX', ttl);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }
}

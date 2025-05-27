import { INestApplication, Injectable,type OnModuleDestroy,type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma'; 

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {
  public async onModuleInit() {
    await this.$connect();
  }

  public async onModuleDestroy() {
    await this.$disconnect();
  }

}
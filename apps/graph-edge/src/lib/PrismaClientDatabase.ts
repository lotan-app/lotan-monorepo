import { PrismaClient } from '@prisma/client';
import { ACTION } from './enums/Action';
import { ID } from './types/ID';
import { IDatabase } from './types/IDatabase';
import { IPersistentItem } from './types/IPersistentItem';

export class PrismaClientDatabase implements IDatabase {
  prisma: PrismaClient;

  async initPrisma() {
    const { PrismaClient } = await import('@prisma/client');
    this.prisma = new PrismaClient();
    await this.prisma.$connect();
  }

  async get<T>(entity: string, id: ID): Promise<T | undefined> {
    const data = await this.prisma[entity].findUnique({
      where: {
        id,
      },
    });

    return data;
  }

  async persistData(data: IPersistentItem[]): Promise<void> {
    const operations = [];

    data.forEach(item => {
      switch (item.action) {
        case ACTION.UPDATE:
          operations.push(this.upsert(item.entity, item.id, item.data));
          break;
        case ACTION.DELETE:
          operations.push(this.delete(item.entity, item.id));
          break;
      }
    });

    await this.prisma.$transaction(operations);
  }

  private upsert(entity: string, id: ID, data: any) {
    return this.prisma[entity].upsert({
      where: { id },
      update: data,
      create: data,
    });
  }

  private delete(entity: string, id: ID) {
    return this.prisma[entity].deleteMany({
      where: { id },
    });
  }
}

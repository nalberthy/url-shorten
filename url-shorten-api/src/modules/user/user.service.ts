import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(userData: { name: string; email: string; password: string }) {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserStats(userId: string) {
    const [urlCount, totalClicks] = await Promise.all([
      this.prisma.url.count({
        where: { userId, isActive: true },
      }),
      this.prisma.url.aggregate({
        _sum: { clickCount: true },
        where: { userId, isActive: true },
      }),
    ]);

    return {
      totalUrls: urlCount,
      totalClicks: totalClicks._sum.clickCount || 0,
    };
  }
}
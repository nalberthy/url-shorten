import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  async createUrl(createUrlDto: CreateUrlDto) {
    const { originalUrl, customCode } = createUrlDto;
    
    if (customCode) {
      const existing = await this.prisma.url.findFirst({
        where: { customCode }
      });
      
      if (existing) {
        throw new ConflictException('Custom code is already in use');
      }
    }

    let shortCode: string;
    do {
      shortCode = nanoid(6);
    } while (await this.prisma.url.findFirst({ where: { shortCode } }));
    
    const url = await this.prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        customCode,
      },
    });
    
    return {
      ...url,
      shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${customCode || shortCode}`,
    };
  }

  async getUrls(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [urls, total] = await Promise.all([
      this.prisma.url.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.url.count({ where: { isActive: true } }),
    ]);
    
    return {
      urls: urls.map(url => ({
        ...url,
        clicks: url.clickCount,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.customCode || url.shortCode}`,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByCode(code: string) {
    const url = await this.prisma.url.findFirst({
      where: {
        OR: [
          { shortCode: code },
          { customCode: code }
        ],
        isActive: true,
      },
    });
    
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.prisma.url.update({
      where: { id: url.id },
      data: { clickCount: { increment: 1 } },
    });
    
    return url;
  }

  async getStats() {
    const [totalUrls, totalClicks] = await Promise.all([
      this.prisma.url.count({ where: { isActive: true } }),
      this.prisma.url.aggregate({
        _sum: { clickCount: true },
        where: { isActive: true },
      }),
    ]);
    
    const topUrls = await this.prisma.url.findMany({
      where: { isActive: true },
      orderBy: { clickCount: 'desc' },
      take: 10,
      select: {
        shortCode: true,
        customCode: true,
        originalUrl: true,
        clickCount: true,
        createdAt: true,
      },
    });
    
    return {
      totalUrls,
      totalClicks: totalClicks._sum.clickCount || 0,
      topUrls: topUrls.map(url => ({
        ...url,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.customCode || url.shortCode}`,
      })),
    };
  }
}
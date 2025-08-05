import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';

const { BASE_URL } = process.env;
@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  async createUrl(createUrlDto: CreateUrlDto, userId?: string) {
    const { originalUrl, customCode, isPublic } = createUrlDto;

    if (customCode) {
      const existing = await this.prisma.url.findUnique({
        where: { customCode }
      });
      
      if (existing) {
        throw new ConflictException('Custom code is already in use');
      }
    }

    let shortCode: string;
    do {
      shortCode = nanoid(6);
    } while (await this.prisma.url.findUnique({ where: { shortCode } }));

    const url = await this.prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        customCode,
        isPublic: isPublic ?? true,
        userId,
      },
    });
    
    return {
      ...url,
      shortUrl: `${BASE_URL}/${customCode || shortCode}`,
    };
  }

  async getUrls(page = 1, limit = 10, userId?: string) {
    const skip = (page - 1) * limit;
    
    const whereCondition = userId ? {
      OR: [
        { userId, isActive: true },
        { isPublic: true, isActive: true }
      ]
    } : {
      isPublic: true,
      isActive: true
    };
    
    const [urls, total] = await Promise.all([
      this.prisma.url.findMany({
        where: whereCondition,
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.url.count({ where: whereCondition }),
    ]);
    
    return {
      urls: urls.map(url => ({
        ...url,
        clicks: url.clickCount,
        shortUrl: `${BASE_URL}/${url.customCode || url.shortCode}`,
        isOwner: url.userId === userId,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMyUrls(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [urls, total] = await Promise.all([
      this.prisma.url.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.url.count({ where: { userId, isActive: true } }),
    ]);
    
    return {
      urls: urls.map(url => ({
        ...url,
        clicks: url.clickCount,
        shortUrl: `${BASE_URL}/${url.customCode || url.shortCode}`,
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

  async deleteUrl(code: string, userId: string) {
  // TODO: implement soft delete to improve semantics
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
    
    if (url.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this URL');
    }
    
    await this.prisma.url.update({
      where: { id: url.id },
      data: { isActive: false },
    });
    
    return { message: 'URL deleted successfully' };
  }

  async getStats(userId?: string) {
    if (userId) {
      const [totalUrls, totalClicks, topUrls] = await Promise.all([
        this.prisma.url.count({ where: { userId, isActive: true } }),
        this.prisma.url.aggregate({
          _sum: { clickCount: true },
          where: { userId, isActive: true },
        }),
        this.prisma.url.findMany({
          where: { userId, isActive: true },
          orderBy: { clickCount: 'desc' },
          take: 5,
          select: {
            shortCode: true,
            customCode: true,
            originalUrl: true,
            clickCount: true,
            createdAt: true,
          },
        }),
      ]);
      
      return {
        totalUrls,
        totalClicks: totalClicks._sum.clickCount || 0,
        topUrls: topUrls.map(url => ({
          ...url,
          shortUrl: `${BASE_URL}/${url.customCode || url.shortCode}`,
        })),
      };
    } else {
      const [totalUrls, totalClicks, topUrls] = await Promise.all([
        this.prisma.url.count({ where: { isActive: true } }),
        this.prisma.url.aggregate({
          _sum: { clickCount: true },
          where: { isActive: true },
        }),
        this.prisma.url.findMany({
          where: { isActive: true },
          orderBy: { clickCount: 'desc' },
          take: 10,
          include: {
            user: {
              select: { name: true }
            }
          },
        }),
      ]);
      
      return {
        totalUrls,
        totalClicks: totalClicks._sum.clickCount || 0,
        topUrls: topUrls.map(url => ({
          ...url,
          shortUrl: `${BASE_URL}/${url.customCode || url.shortCode}`,
          creator: url.user?.name || 'Anonymous',
        })),
      };
    }
  }

}
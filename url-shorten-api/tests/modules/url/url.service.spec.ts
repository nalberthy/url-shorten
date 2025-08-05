import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UrlService } from '../../../src/modules/url/url.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { CreateUrlDto } from '../../../src/modules/url/dto/create-url.dto';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'abc123'),
}));

describe('UrlService', () => {
  let service: UrlService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  let mockPrismaService;

  beforeEach(async () => {
    mockPrismaService = {
      url: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUrl', () => {
    const createUrlDto: CreateUrlDto = {
      originalUrl: 'https://example.com',
      customCode: 'custom123',
    };

    it('should create a URL with custom code successfully', async () => {
      const mockUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        customCode: 'custom123',
        clickCount: 0,
        isActive: true,
        isPublic: true,
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.url.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.url.create.mockResolvedValue(mockUrl);

      const result = await service.createUrl(createUrlDto, 'user1');

      expect(result).toHaveProperty('shortUrl');
      expect(mockPrismaService.url.create).toHaveBeenCalled();
    });
  });

  describe('getUserUrls', () => {
    it('should return paginated user URLs', async () => {
      const mockUrls = [
        {
          id: '1',
          originalUrl: 'https://example1.com',
          shortCode: 'p4lm4s',
          customCode: null,
          clickCount: 5,
          createdAt: new Date(),
          userId: 'user1',
        },
      ];

      mockPrismaService.url.findMany.mockResolvedValue(mockUrls);
      mockPrismaService.url.count.mockResolvedValue(1);

      const result = await service.getUrls(1, 10, 'user1');

      expect(result.urls).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockPrismaService.url.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: 'user1', isActive: true },
            { isPublic: true, isActive: true },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findByCode', () => {
    const mockUrl = {
      id: '1',
      originalUrl: 'https://example-test.com',
      shortCode: 'abc123',
      customCode: null,
      isActive: true,
      userId: 'user1',
      clickCount: 0,
    };

    it('should return URL and increment click count', async () => {
      mockPrismaService.url.findFirst.mockResolvedValue(mockUrl);
      mockPrismaService.url.update.mockResolvedValue({
        ...mockUrl,
        clickCount: 1,
      });

      const result = await service.findByCode('abc123');

      expect(mockPrismaService.url.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ shortCode: 'abc123' }, { customCode: 'abc123' }],
          isActive: true,
        },
      });

      expect(mockPrismaService.url.update).toHaveBeenCalledWith({
        where: { id: mockUrl.id },
        data: { clickCount: { increment: 1 } },
      });

      expect(result).toEqual(mockUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockPrismaService.url.findFirst.mockResolvedValue(null);

      await expect(service.findByCode('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

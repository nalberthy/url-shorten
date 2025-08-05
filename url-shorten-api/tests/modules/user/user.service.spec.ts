import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../../../src/modules/user/user.service';
import { PrismaService } from '../../../src/database/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    url: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should persist a new user', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      const mockUser = {
        id: '1',
        ...input,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create(input);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserStats', () => {
    it('should return total URLs and clicks', async () => {
      mockPrisma.url.count.mockResolvedValue(10);
      mockPrisma.url.aggregate.mockResolvedValue({ _sum: { clickCount: 100 } });

      const result = await service.getUserStats('1');

      expect(prisma.url.count).toHaveBeenCalledWith({
        where: { userId: '1', isActive: true },
      });

      expect(prisma.url.aggregate).toHaveBeenCalledWith({
        where: { userId: '1', isActive: true },
        _sum: { clickCount: true },
      });

      expect(result).toEqual({ totalUrls: 10, totalClicks: 100 });
    });

    it('should handle null click count gracefully', async () => {
      mockPrisma.url.count.mockResolvedValue(5);
      mockPrisma.url.aggregate.mockResolvedValue({
        _sum: { clickCount: null },
      });

      const result = await service.getUserStats('1');

      expect(result).toEqual({ totalUrls: 5, totalClicks: 0 });
    });
  });
});

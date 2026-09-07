import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('hashes the password and creates a user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        createdAt: new Date(),
      });

      const dto = { email: 'test@test.com', password: 'password123', name: 'Test' };
      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: 'hashed-password' }),
        }),
      );
      expect(result.email).toBe('test@test.com');
    });

    it('throws ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.create({ email: 'test@test.com', password: 'password123', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findOrCreateByGoogleId', () => {
    it('returns existing user if googleId already linked', async () => {
      const existingUser = { id: '1', googleId: 'g-123', email: 'test@test.com' };
      prisma.user.findUnique.mockResolvedValueOnce(existingUser); // googleId lookup

      const result = await service.findOrCreateByGoogleId('g-123', 'test@test.com', 'Test');

      expect(result).toEqual(existingUser);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('links googleId to existing email account if found', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // no user with this googleId
        .mockResolvedValueOnce({ id: '1', email: 'test@test.com' }); // existing email account
      prisma.user.update.mockResolvedValue({ id: '1', googleId: 'g-123' });

      const result = await service.findOrCreateByGoogleId('g-123', 'test@test.com', 'Test');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { googleId: 'g-123' },
      });
      expect(result.googleId).toBe('g-123');
    });

    it('creates a new user if no existing account found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValue({ id: '2', googleId: 'g-456', email: 'new@test.com' });

      const result = await service.findOrCreateByGoogleId('g-456', 'new@test.com', 'New');

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { googleId: 'g-456', email: 'new@test.com', name: 'New' },
      });
      expect(result.id).toBe('2');
    });
  });
});
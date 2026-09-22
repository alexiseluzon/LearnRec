import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findOrCreateByGoogleId: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOrCreateByGoogleId: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'signed-jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@test.com',
      });
    });

    it('throws UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if user has no password (OAuth-only account)', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: null,
      });

      await expect(
        service.login({ email: 'oauth@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password does not match', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signup', () => {
    it('creates a user and returns an access token', async () => {
      usersService.create.mockResolvedValue({ id: '1', email: 'new@test.com' });

      const result = await service.signup({
        email: 'new@test.com',
        password: 'password123',
        name: 'New',
      });

      expect(result).toEqual({ accessToken: 'signed-jwt-token' });
    });
  });

  describe('loginWithGoogle', () => {
    it('finds or creates a user and returns an access token', async () => {
      usersService.findOrCreateByGoogleId.mockResolvedValue({
        id: '1',
        email: 'google@test.com',
      });

      const result = await service.loginWithGoogle({
        googleId: 'g-123',
        email: 'google@test.com',
        name: 'Google User',
      });

      expect(result).toEqual({ accessToken: 'signed-jwt-token' });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';

const mockUser = {
  id: 1,
  username: 'john',
  password_hash: 'hashed',
  email: 'john@example.com',
  role: { name: 'admin' },
};

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByUsername: jest.fn(),
  } as unknown as UsersService;
  const jwtService = {
    sign: jest.fn(),
  } as unknown as JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const dto: LoginDto = { username: 'john', password: 'secret' };

    it('throws when user is not found', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValueOnce(null);

      await expect(service.validateUser(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when password comparison fails', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as any);

      await expect(service.validateUser(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns user on success', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as any);

      await expect(service.validateUser(dto)).resolves.toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('returns access token and user info', async () => {
      const dto: LoginDto = { username: 'john', password: 'secret' };
      const signedToken = 'signed.jwt.token';

      jest.spyOn(service, 'validateUser').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(signedToken as any);

      const result = await service.login(dto);

      expect(service.validateUser).toHaveBeenCalledWith(dto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role.name,
      });
      expect(result).toEqual({
        access_token: signedToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role.name,
        },
      });
    });
  });
});

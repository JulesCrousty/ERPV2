import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/modules/auth/auth.service';
import { LoginDto } from '../src/modules/auth/dto/login.dto';
import { Role } from '../src/modules/auth/entities/role.entity';
import { User } from '../src/modules/auth/entities/user.entity';
import { UsersService } from '../src/modules/auth/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  const usersService: Partial<UsersService> = {};
  const jwtService: Partial<JwtService> = { signAsync: jest.fn() };

  beforeEach(() => {
    authService = new AuthService(usersService as UsersService, jwtService as JwtService);
  });

  it('should validate user with correct credentials', async () => {
    const role = { id: 1, name: 'admin' } as Role;
    const user = {
      id: 1,
      username: 'test',
      passwordHash: 'hashed',
      role,
    } as User;
    usersService.findByUsername = jest.fn().mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await authService.validateUser('test', 'password');
    expect(result).toEqual(user);
  });

  it('should return null when credentials are invalid', async () => {
    usersService.findByUsername = jest.fn().mockResolvedValue(null);
    const result = await authService.validateUser('wrong', 'password');
    expect(result).toBeNull();
  });

  it('should login and return access token', async () => {
    const role = { id: 1, name: 'admin' } as Role;
    const user = { id: 1, username: 'test', passwordHash: 'hashed', role } as User;
    usersService.findByUsername = jest.fn().mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('token');

    const dto: LoginDto = { username: 'test', password: 'password' };
    const result = await authService.login(dto);
    expect(result).toEqual({ access_token: 'token' });
    expect(jwtService.signAsync).toHaveBeenCalled();
  });

  it('should throw unauthorized on invalid login', async () => {
    usersService.findByUsername = jest.fn().mockResolvedValue(null);
    const dto: LoginDto = { username: 'test', password: 'password' };

    await expect(authService.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

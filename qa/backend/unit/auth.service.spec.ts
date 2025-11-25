import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../../backend/src/modules/auth/auth.service';
import { UsersService } from '../../../backend/src/modules/auth/users.service';
import { LoginDto } from '../../../backend/src/modules/auth/dto/login.dto';
import { Role } from '../../../backend/src/modules/auth/entities/role.entity';
import { User } from '../../../backend/src/modules/auth/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService (QA)', () => {
  let service: AuthService;
  const usersService: Partial<UsersService> = {};
  const jwtService: Partial<JwtService> = { signAsync: jest.fn() };

  beforeEach(() => {
    service = new AuthService(usersService as UsersService, jwtService as JwtService);
  });

  it('should validate a user with a matching password hash', async () => {
    const role = { id: 1, name: 'admin' } as Role;
    const user = { id: 1, username: 'qa', passwordHash: 'hash', role } as User;
    usersService.findByUsername = jest.fn().mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('qa', 'pass');
    expect(result).toEqual(user);
  });

  it('should return null when user is missing', async () => {
    usersService.findByUsername = jest.fn().mockResolvedValue(null);
    const result = await service.validateUser('ghost', 'nopass');
    expect(result).toBeNull();
  });

  it('should issue a JWT token during login', async () => {
    const role = { id: 2, name: 'approver' } as Role;
    const user = { id: 2, username: 'qa', passwordHash: 'hash', role } as User;
    usersService.findByUsername = jest.fn().mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('qa-token');

    const result = await service.login({ username: 'qa', password: 'secret' } as LoginDto);
    expect(result).toEqual({ access_token: 'qa-token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: user.id, role: role.name });
  });

  it('should throw UnauthorizedException on invalid password', async () => {
    const role = { id: 3, name: 'viewer' } as Role;
    const user = { id: 3, username: 'qa', passwordHash: 'hash', role } as User;
    usersService.findByUsername = jest.fn().mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ username: 'qa', password: 'wrong' } as LoginDto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

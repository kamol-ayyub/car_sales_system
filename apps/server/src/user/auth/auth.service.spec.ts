import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user.service';
import { RegisterDto } from './register.dto';
import { User, UserRole } from '../entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UserService, 'findByEmail' | 'create'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let passwordService: jest.Mocked<Pick<PasswordService, 'verify'>>;

  const user: User = {
    id: 'uuid-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: null,
    passwordHash: 'hashed',
    roles: [UserRole.CLIENT],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const registerDto: RegisterDto = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: null,
    password: 'secret123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        {
          provide: PasswordService,
          useValue: { hash: jest.fn(), verify: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UserService);
    jwtService = module.get(JwtService);
    passwordService = module.get(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user with CLIENT role when email is not taken', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(user);

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'john.doe@example.com',
      );
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        roles: [UserRole.CLIENT],
      });
      expect(result).toBe(user);
    });

    it('should throw ConflictException when email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a JWT when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.verify.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const token = await service.login('john.doe@example.com', 'secret123');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        roles: user.roles,
      });
      expect(token).toBe('jwt-token');
    });

    it('should throw UnauthorizedException when email is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('missing@example.com', 'secret123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.verify.mockResolvedValue(false);

      await expect(
        service.login('john.doe@example.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

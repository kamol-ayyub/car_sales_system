import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user.service';
import { RegisterDto } from './register.dto';
import { User, UserRole } from '../entities/user.entity';
import { hashToken } from './token-hash';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<
      UserService,
      | 'findByEmail'
      | 'create'
      | 'findById'
      | 'incrementTokenVersion'
      | 'setRefreshTokenHash'
    >
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync' | 'verifyAsync'>>;
  let passwordService: jest.Mocked<
    Pick<PasswordService, 'verify' | 'getDummyHash'>
  >;

  const authConfig = {
    jwt: {
      accessSecret: 'access-secret-access-secret-access',
      accessExpiresIn: '10s',
      refreshSecret: 'refresh-secret-refresh-secret-ref',
      refreshExpiresIn: '1m',
      issuer: 'car-sales-system',
      audience: 'car-sales-system',
    },
  };

  const user: User = {
    id: 'uuid-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: null,
    passwordHash: 'hashed',
    refreshTokenHash: hashToken('old-refresh'),
    roles: [UserRole.CLIENT],
    tokenVersion: 0,
    purchases: [],
    sales: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const registerDto: RegisterDto = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: undefined,
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
            findById: jest.fn(),
            incrementTokenVersion: jest.fn(),
            setRefreshTokenHash: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
            getDummyHash: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(authConfig),
          },
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
    it('should create a user with CLIENT role and return tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        roles: [UserRole.CLIENT],
      });
      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(
        user.id,
        hashToken('refresh-token'),
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
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
    it('should return tokens when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.verify.mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const tokens = await service.login('john.doe@example.com', 'secret123');

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException when email is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      passwordService.getDummyHash.mockResolvedValue('dummy-hash');
      passwordService.verify.mockResolvedValue(false);

      await expect(
        service.login('missing@example.com', 'secret123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(passwordService.getDummyHash).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(user);
      passwordService.verify.mockResolvedValue(false);

      await expect(
        service.login('john.doe@example.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    const refreshPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      typ: 'refresh' as const,
      tokenVersion: 0,
    };

    it('should rotate tokens when refresh token is valid', async () => {
      jwtService.verifyAsync.mockResolvedValue(refreshPayload);
      usersService.findById.mockResolvedValue(user);
      jwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const tokens = await service.refreshTokens('old-refresh');

      expect(usersService.setRefreshTokenHash).toHaveBeenCalledWith(
        user.id,
        hashToken('new-refresh'),
      );
      expect(tokens).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refreshTokens('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user no longer exists', async () => {
      jwtService.verifyAsync.mockResolvedValue(refreshPayload);
      usersService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens('old-refresh')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

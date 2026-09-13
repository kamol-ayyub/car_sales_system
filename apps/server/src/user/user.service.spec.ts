import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserService } from './user.service';
import { PasswordService } from './password/password.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let passwordService: jest.Mocked<Pick<PasswordService, 'hash'>>;

  const createUserDto: CreateUserDto = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    roles: [UserRole.SALES_PERSON],
  };

  beforeEach(async () => {
    userRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    passwordService = {
      hash: jest.fn().mockResolvedValue('hashedPassword'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create user when email is available', async () => {
      (userRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      const createdUser = {
        id: 'uuid-1',
        ...createUserDto,
        passwordHash: 'hashedPassword',
        tokenVersion: 0,
      } as User;
      (userRepository.create as jest.Mock).mockReturnValue(createdUser);
      (userRepository.save as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(passwordService.hash).toHaveBeenCalledWith('password123');
      expect(result).toBe(createdUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      (userRepository.findOneBy as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should query users excluding owner role', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'u1', roles: [UserRole.CLIENT] },
          { id: 'u2', roles: [UserRole.SALES_PERSON] },
        ]),
      };
      userRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      const result = await service.findAll();

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'NOT (:ownerRole = ANY(user.roles))',
        { ownerRole: UserRole.OWNER },
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('updateRole', () => {
    it('should update user roles and save', async () => {
      const existingUser = {
        id: 'u1',
        roles: [UserRole.CLIENT],
      } as User;
      (userRepository.findOneBy as jest.Mock).mockResolvedValue(existingUser);
      (userRepository.save as jest.Mock).mockImplementation((u) =>
        Promise.resolve(u),
      );

      const result = await service.updateRole('u1', [UserRole.SALES_PERSON]);

      expect(result.roles).toEqual([UserRole.SALES_PERSON]);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: [UserRole.SALES_PERSON],
        }),
      );
    });
  });
});

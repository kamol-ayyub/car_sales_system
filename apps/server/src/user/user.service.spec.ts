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
      findAndCount: jest.fn(),
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
      } as unknown as User;
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
    let mockQueryBuilder: {
      alias: string;
      where: jest.Mock;
      andWhere: jest.Mock;
      orderBy: jest.Mock;
      addOrderBy: jest.Mock;
      skip: jest.Mock;
      take: jest.Mock;
      getManyAndCount: jest.Mock;
    };

    beforeEach(() => {
      mockQueryBuilder = {
        alias: 'user',
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      userRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated users excluding owners by default', async () => {
      const users = [
        { id: 'u1', roles: [UserRole.CLIENT] },
        { id: 'u2', roles: [UserRole.SALES_PERSON] },
      ] as User[];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([users, 2]);

      const result = await service.findAll({
        page: 1,
        limit: 20,
        sortOrder: 'DESC',
      });

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'NOT (:ownerRole = ANY(user.roles))',
        { ownerRole: UserRole.OWNER },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.created_at',
        'DESC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'user.id',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should apply role filter and pagination when provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        role: UserRole.SALES_PERSON,
        page: 3,
        limit: 10,
        sortOrder: 'ASC',
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'NOT (:ownerRole = ANY(user.roles))',
        { ownerRole: UserRole.OWNER },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        ':role = ANY(user.roles)',
        { role: UserRole.SALES_PERSON },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.created_at',
        'ASC',
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'user.id',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should escape LIKE wildcards and apply search filter on name, email and phone', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        search: 'john%doe_test\\',
        page: 1,
        limit: 20,
        sortOrder: 'DESC',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: '%john\\%doe\\_test\\\\%' },
      );
    });

    it('should return totalPages 0 when total is 0', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({
        page: 1,
        limit: 20,
        sortOrder: 'DESC',
      });

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
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

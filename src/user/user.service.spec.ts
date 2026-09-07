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
      } as User);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});

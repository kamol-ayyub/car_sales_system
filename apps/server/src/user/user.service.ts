import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Paginated } from '@repo/api/pagination';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { PasswordService } from './password/password.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const isUserExist = await this.findByEmail(createUserDto.email);
    if (isUserExist) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async createClient(createClientDto: CreateClientDto): Promise<User> {
    const email = createClientDto.email || null;

    if (email) {
      const escapedEmail = email.replace(/[%_\\]/g, '\\$&');
      const isEmailTaken = await this.userRepository.findOne({
        where: { email: ILike(escapedEmail) },
      });
      if (isEmailTaken) {
        throw new ConflictException('A client with this email already exists');
      }
    }

    const client = this.userRepository.create({
      name: createClientDto.name,
      phone: createClientDto.phone,
      email,
      passwordHash: null,
      roles: [UserRole.CLIENT],
    });

    return this.userRepository.save(client);
  }

  async findAll(query: ListUsersQueryDto): Promise<Paginated<User>> {
    const { role, search, page, limit, sortOrder } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('NOT (:ownerRole = ANY(user.roles))', {
        ownerRole: UserRole.OWNER,
      });

    if (role) {
      qb.andWhere(':role = ANY(user.roles)', { role });
    }

    if (search) {
      const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
      qb.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        {
          search: `%${escapedSearch}%`,
        },
      );
    }

    qb.orderBy('user.created_at', sortOrder)
      .addOrderBy('user.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, field: keyof User = 'id'): Promise<User> {
    const user = await this.userRepository.findOneBy({ [field]: id });
    if (!user) {
      throw new NotFoundException(`User with ${field} ${id} not found`);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await this.userRepository.increment({ id }, 'tokenVersion', 1);
  }

  async setRefreshTokenHash(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userRepository.update({ id }, { refreshTokenHash });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      user.passwordHash = await this.passwordService.hash(
        updateUserDto.password,
      );
      user.tokenVersion += 1;
      user.refreshTokenHash = null;
    }
    const rest = { ...updateUserDto };
    delete rest.password;
    Object.assign(user, rest);
    return this.userRepository.save(user);
  }

  async updateRole(id: string, roles: UserRole[]): Promise<User> {
    const user = await this.findOne(id);
    user.roles = roles;
    user.tokenVersion += 1;
    user.refreshTokenHash = null;
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}

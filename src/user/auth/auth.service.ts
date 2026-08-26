import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  public async register(createUserDto: CreateUserDto): Promise<User> {
    const isUserExist = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (isUserExist) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create(createUserDto);

    return user;
  }

  public async login(email: string, password: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !(await this.passwordService.verify(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateJwtToken(user);
  }
  private generateJwtToken(user: User): string {
    const payload = { sub: user.id, email: user.email, roles: user.roles };

    return this.jwtService.sign(payload);
  }
}

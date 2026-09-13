import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './register.dto';
import { User, UserRole } from '../entities/user.entity';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<User> {
    const isUserExist = await this.usersService.findByEmail(registerDto.email);

    if (isUserExist) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create({
      ...registerDto,
      roles: [UserRole.CLIENT],
    });

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

  public refreshToken(user: User) {
    return this.generateJwtToken(user);
  }
  private generateJwtToken(user: User): string {
    const payload = { sub: user.id, email: user.email, roles: user.roles };

    return this.jwtService.sign(payload);
  }
}

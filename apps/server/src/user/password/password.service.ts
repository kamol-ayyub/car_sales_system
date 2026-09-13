import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;
  private dummyHashPromise: Promise<string> | null = null;

  public async hash(password: string): Promise<string> {
    return await hash(password, this.SALT_ROUNDS);
  }

  public getDummyHash(): Promise<string> {
    if (!this.dummyHashPromise) {
      this.dummyHashPromise = hash(
        'timing-safe-dummy-password',
        this.SALT_ROUNDS,
      );
    }
    return this.dummyHashPromise;
  }

  public async verify(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await compare(password, hashedPassword);
  }
}

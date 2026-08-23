import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarService } from './car.service';
import { Car } from './entities/car.entity';
import { User } from '@/user/entities/user.entity';

describe('CarService', () => {
  let service: CarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: getRepositoryToken(Car),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CarService>(CarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

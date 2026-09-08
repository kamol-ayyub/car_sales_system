import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarService } from './car.service';
import { Car, CarStatus } from './entities/car.entity';
import { User, UserRole } from '@/user/entities/user.entity';

describe('CarService', () => {
  let service: CarService;
  let carRepository: { findOne: jest.Mock; save: jest.Mock };
  let userRepository: { findOneBy: jest.Mock };

  const salesPerson: User = {
    id: 'sales-uuid',
    name: 'Sales Person',
    email: 'sales@example.com',
    phone: null,
    passwordHash: 'hashed',
    roles: [UserRole.SALES_PERSON],
    createdAt: new Date(),
    updatedAt: new Date(),
    purchases: [],
    sales: [],
  };

  const client: User = {
    id: 'client-uuid',
    name: 'Client',
    email: 'client@example.com',
    phone: null,
    passwordHash: 'hashed',
    roles: [UserRole.CLIENT],
    createdAt: new Date(),
    updatedAt: new Date(),
    purchases: [],
    sales: [],
  };

  const availableCar: Car = {
    id: 'car-uuid',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    price: 20000,
    salePrice: null,
    vin: 'VIN12345678901234',
    status: CarStatus.AVAILABLE,
    images: [],
    salesPerson: null,
    client: null,
    soldAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    carRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        { provide: getRepositoryToken(Car), useValue: carRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<CarService>(CarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sell', () => {
    it('should sell an available car', async () => {
      carRepository.findOne.mockResolvedValue({ ...availableCar });
      userRepository.findOneBy.mockImplementation((where: { id: string }) =>
        Promise.resolve(where.id === client.id ? client : salesPerson),
      );
      carRepository.save.mockImplementation((car: Car) => Promise.resolve(car));

      const result = await service.sell('car-uuid', salesPerson.id, {
        clientId: client.id,
      });

      expect(carRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: CarStatus.SOLD,
          client,
          salesPerson,
          soldAt: expect.any(Date) as Date,
          salePrice: 20000,
        }),
      );
      expect(result.status).toBe(CarStatus.SOLD);
    });

    it('should use salePrice when provided', async () => {
      carRepository.findOne.mockResolvedValue({ ...availableCar });
      userRepository.findOneBy.mockImplementation((where: { id: string }) =>
        Promise.resolve(where.id === client.id ? client : salesPerson),
      );
      carRepository.save.mockImplementation((car: Car) => Promise.resolve(car));

      await service.sell('car-uuid', salesPerson.id, {
        clientId: client.id,
        salePrice: 18500,
      });

      expect(carRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ salePrice: 18500 }),
      );
    });

    it('should throw ConflictException when car is already sold', async () => {
      carRepository.findOne.mockResolvedValue({
        ...availableCar,
        status: CarStatus.SOLD,
      });

      await expect(
        service.sell('car-uuid', salesPerson.id, { clientId: client.id }),
      ).rejects.toThrow(ConflictException);
      expect(carRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when car does not exist', async () => {
      carRepository.findOne.mockResolvedValue(null);

      await expect(
        service.sell('missing-car', salesPerson.id, { clientId: client.id }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when client does not exist', async () => {
      carRepository.findOne.mockResolvedValue({ ...availableCar });
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.sell('car-uuid', salesPerson.id, {
          clientId: 'missing-client',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when client is not a client', async () => {
      carRepository.findOne.mockResolvedValue({ ...availableCar });
      userRepository.findOneBy.mockImplementation((where: { id: string }) =>
        Promise.resolve(
          where.id === client.id
            ? { ...client, roles: [UserRole.SALES_PERSON] }
            : salesPerson,
        ),
      );

      await expect(
        service.sell('car-uuid', salesPerson.id, { clientId: client.id }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

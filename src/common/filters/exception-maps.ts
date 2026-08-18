import { HttpStatus } from '@nestjs/common';

export const POSTGRES_ERRORS: Record<
  string,
  {
    status: number;
    code: string;
    message: string;
  }
> = {
  '23505': {
    status: HttpStatus.CONFLICT,
    code: 'RESOURCE_ALREADY_EXISTS',
    message: 'This resource already exists.',
  },

  '23503': {
    status: HttpStatus.CONFLICT,
    code: 'RESOURCE_REFERENCE_ERROR',
    message:
      'This operation cannot be completed because the resource is being used.',
  },

  '23502': {
    status: HttpStatus.BAD_REQUEST,
    code: 'REQUIRED_FIELD_MISSING',
    message: 'A required field is missing.',
  },

  '23514': {
    status: HttpStatus.BAD_REQUEST,
    code: 'INVALID_RESOURCE',
    message: 'The provided data is invalid.',
  },

  '22P02': {
    status: HttpStatus.BAD_REQUEST,
    code: 'INVALID_VALUE',
    message: 'One or more provided values are invalid.',
  },

  '22001': {
    status: HttpStatus.BAD_REQUEST,
    code: 'VALUE_TOO_LONG',
    message: 'One or more provided values are too long.',
  },
};

export const HTTP_ERRORS: Record<
  number,
  {
    code: string;
    message: string;
  }
> = {
  [HttpStatus.BAD_REQUEST]: {
    code: 'BAD_REQUEST',
    message: 'The request is invalid.',
  },

  [HttpStatus.UNAUTHORIZED]: {
    code: 'UNAUTHORIZED',
    message: 'You need to sign in to continue.',
  },

  [HttpStatus.FORBIDDEN]: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action.',
  },

  [HttpStatus.NOT_FOUND]: {
    code: 'NOT_FOUND',
    message: 'The requested resource was not found.',
  },

  [HttpStatus.CONFLICT]: {
    code: 'CONFLICT',
    message: 'The request conflicts with the current state of the resource.',
  },

  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    code: 'VALIDATION_ERROR',
    message: 'Please check the provided information.',
  },

  [HttpStatus.TOO_MANY_REQUESTS]: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  },

  [HttpStatus.SERVICE_UNAVAILABLE]: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'The service is temporarily unavailable. Please try again later.',
  },
};

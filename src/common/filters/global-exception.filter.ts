import { HTTP_ERRORS, POSTGRES_ERRORS } from '@/common/filters/exception-maps';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof QueryFailedError) {
      const postgresError = exception.driverError as {
        code?: string;
      };

      const error = postgresError.code
        ? POSTGRES_ERRORS[postgresError.code]
        : undefined;

      return response
        .status(error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          success: false,
          error: {
            code: error?.code ?? 'DATABASE_ERROR',
            message:
              error?.message ??
              'Something went wrong while processing your request.',
          },
        });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      const error = HTTP_ERRORS[status];

      return response.status(status).json({
        success: false,
        error: {
          code: error?.code ?? 'HTTP_ERROR',
          message:
            error?.message ??
            'Something went wrong while processing your request.',
        },
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong. Please try again later.',
      },
    });
  }
}

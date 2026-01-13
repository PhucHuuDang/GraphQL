import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError,
} from '@prisma/client/runtime/library';
// } from 'generated/prisma/runtime/library';

export class PrismaErrorHelper {
  static handle(error: any, context?: string): never {
    const contextMsg = context ? ` (${context})` : '';

    console.error({ contextMsg });

    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        // --- Connection errors ---
        case 'P1000':
          throw new ServiceUnavailableException(
            `Authentication failed at database${contextMsg}`,
          );
        case 'P1001':
          throw new ServiceUnavailableException(
            `Can't reach database server${contextMsg}`,
          );
        case 'P1002':
          throw new ServiceUnavailableException(
            `Database server connection timeout${contextMsg}`,
          );
        case 'P1003':
          throw new ServiceUnavailableException(
            `Database does not exist${contextMsg}`,
          );
        case 'P1008':
          throw new ServiceUnavailableException(
            `Operations timed out${contextMsg}`,
          );
        case 'P1009':
          throw new ServiceUnavailableException(
            `Database already exists${contextMsg}`,
          );
        case 'P1010':
          throw new ServiceUnavailableException(
            `Access denied for user${contextMsg}`,
          );
        case 'P1011':
          throw new ServiceUnavailableException(
            `Error opening a TLS connection${contextMsg}`,
          );
        case 'P1017':
          throw new ServiceUnavailableException(
            `Server has closed the connection${contextMsg}`,
          );

        case 'P2025':
          throw new NotFoundException(`Record not found${contextMsg}`);

        // --- Constraint violations ---
        case 'P2002': {
          const target = error.meta?.target;
          const fields = Array.isArray(target)
            ? target.join(', ')
            : target || 'unknown';

          throw new ConflictException(
            `Unique constraint failed on field(s): ${fields as string}${contextMsg}`,
          );
        }
        case 'P2003': {
          const field = error.meta?.field_name;
          throw new BadRequestException(
            `Foreign key constraint failed on field: ${
              (field as string) || 'unknown'
            }${contextMsg}`,
          );
        }
        case 'P2004':
          throw new BadRequestException(
            `A constraint failed on the database${contextMsg}`,
          );

        // --- Data validation errors ---
        case 'P2005':
          throw new BadRequestException(
            `Invalid value stored in the database${contextMsg}`,
          );
        case 'P2006':
          throw new BadRequestException(
            `Provided value is invalid${contextMsg}`,
          );
        case 'P2007':
          throw new BadRequestException(`Data validation error${contextMsg}`);
        case 'P2008':
          throw new BadRequestException(`Failed to parse query${contextMsg}`);
        case 'P2009':
          throw new BadRequestException(
            `Failed to validate query${contextMsg}`,
          );
        case 'P2010':
          throw new InternalServerErrorException(
            `Raw query failed${contextMsg}`,
          );
        case 'P2011':
          throw new BadRequestException(
            `Null constraint violation${contextMsg}`,
          );
        case 'P2012':
          throw new BadRequestException(`Missing required value${contextMsg}`);
        case 'P2013':
          throw new BadRequestException(
            `Missing required argument${contextMsg}`,
          );
        case 'P2014':
          throw new BadRequestException(
            `Required relation violation${contextMsg}`,
          );
        case 'P2015':
          throw new NotFoundException(`Related record not found${contextMsg}`);
        case 'P2016':
          throw new BadRequestException(
            `Query interpretation error${contextMsg}`,
          );
        case 'P2017':
          throw new BadRequestException(
            `Records for relation not connected${contextMsg}`,
          );
        case 'P2018':
          throw new NotFoundException(
            `Required connected records not found${contextMsg}`,
          );
        case 'P2019':
          throw new BadRequestException(`Input error${contextMsg}`);
        case 'P2020':
          throw new BadRequestException(`Value out of range${contextMsg}`);
        case 'P2021':
          throw new NotFoundException(`Table does not exist${contextMsg}`);
        case 'P2022':
          throw new NotFoundException(`Column does not exist${contextMsg}`);
        case 'P2023':
          throw new BadRequestException(
            `Inconsistent column data${contextMsg}`,
          );
        case 'P2024':
          throw new ServiceUnavailableException(
            `Connection pool timeout${contextMsg}`,
          );

        case 'P2026':
          throw new BadRequestException(
            `Unsupported database feature${contextMsg}`,
          );
        case 'P2027':
          throw new InternalServerErrorException(
            `Multiple database errors occurred${contextMsg}`,
          );
        case 'P2028':
          throw new InternalServerErrorException(
            `Transaction API error${contextMsg}`,
          );
        case 'P2030':
          throw new BadRequestException(
            `Cannot find fulltext index${contextMsg}`,
          );
        case 'P2033':
          throw new BadRequestException(`Number out of range${contextMsg}`);
        case 'P2034':
          throw new ConflictException(
            `Transaction failed due to write conflict${contextMsg}`,
          );

        // --- Default fallback ---
        default:
          throw new InternalServerErrorException(
            `Unhandled Prisma error ${error.code}: ${error.message}`,
          );
      }
    }

    // ✅ Lỗi Prisma Client Initialization
    if (error instanceof PrismaClientInitializationError) {
      throw new ServiceUnavailableException(
        `Database initialization failed: ${error.message}`,
      );
    }

    // ✅ Lỗi Prisma Validation
    if (error instanceof PrismaClientValidationError) {
      throw new BadRequestException(`Invalid database query: ${error.message}`);
    }

    // ✅ Lỗi Prisma Rust Panic (hiếm khi xảy ra)
    if (error instanceof PrismaClientRustPanicError) {
      throw new InternalServerErrorException(
        `Critical database engine error: ${error.message}`,
      );
    }

    // ✅ Fallback cho các lỗi không xác định
    throw new InternalServerErrorException(
      `Unexpected error: ${error?.message || 'Unknown error'}`,
    );
  }
}

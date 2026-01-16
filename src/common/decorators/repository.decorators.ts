import { BadRequestException } from '@nestjs/common';

/**
 * Validates that the ID parameter is provided
 */
export function ValidateId() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const id = args[0];
      if (!id) {
        throw new BadRequestException(`ID is required for ${propertyKey}`);
      }
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validates that the where condition is provided
 */
export function ValidateWhere(paramIndex: number = 0) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const where = args[paramIndex];
      if (!where || (typeof where === 'object' && Object.keys(where).length === 0)) {
        throw new BadRequestException(`Where condition is required for ${propertyKey}`);
      }
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validates that data is provided and not empty
 */
export function ValidateData(paramIndex: number = 0) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const data = args[paramIndex];
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        throw new BadRequestException(`Data is required for ${propertyKey}`);
      }
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validates that array data is provided and not empty
 */
export function ValidateArray(paramIndex: number = 0) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const data = args[paramIndex];
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new BadRequestException(`Non-empty array is required for ${propertyKey}`);
      }
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Validates pagination parameters
 */
export function ValidatePagination() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const params = args[0] || {};
      const { page = 1, limit = 10 } = params;

      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (limit < 1) {
        throw new BadRequestException('Limit must be greater than 0');
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

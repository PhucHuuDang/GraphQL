import { Injectable } from '@nestjs/common';
import { User } from 'src/models/user.model';
import { UpdateUser } from './dto/update-user';
import { CreateUser } from './dto/create-user';

@Injectable()
export class UserService {
  async isExists(email: string, id: number) {}
  async create(createUserInput: CreateUser): Promise<
    | User
    | {
        error: string;
        statusCode: number;
      }
  > {
    const test = await Promise.resolve({
      error: 'User already exists',
      statusCode: 400,
    });
    return test;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserInput: UpdateUser) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { Author, Prisma } from '../../generated/prisma';
import { AuthorRepository } from '../modules/authors/author.repository';

@Injectable()
export class AuthorsService {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async createAuthor(author: Prisma.AuthorCreateInput): Promise<Author> {
    const existingAuthor = await this.authorRepository.findUnique({
      ...{
        email: author.email as string,
      },
    });

    if (existingAuthor) {
      throw new BadRequestException('Author already exists');
    }

    return await this.authorRepository.create({
      ...author,
    });
  }
}

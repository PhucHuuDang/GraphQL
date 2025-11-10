import { Injectable } from '@nestjs/common';
import { Author, Prisma } from 'generated/prisma';
import { AuthorRepository } from 'src/authors/author.repository';

@Injectable()
export class AuthorsService {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async createAuthor(author: Prisma.AuthorCreateInput): Promise<Author> {
    return await this.authorRepository.create({
      ...author,
      // posts: {
      //   create: [],
      // },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Author } from 'src/models/author.model';

@Injectable()
export class AuthorsService {
  private authors: Author[] = [
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Nguyen',
      verified: true,
      posts: [],
    },
    { id: 2, firstName: 'Bob', lastName: 'Tran', verified: false, posts: [] },
    { id: 3, firstName: 'Charlie', lastName: 'Le', verified: true, posts: [] },
  ];

  findAll(): Author[] {
    return this.authors;
  }

  findOneById(id: number): Author | null {
    return this.authors.find((author) => author.id === id) || null;
  }
}

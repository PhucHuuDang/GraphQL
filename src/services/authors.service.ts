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
      bio: 'Alice is a software engineer at Google',
      avatarUrl: 'https://alice.com/avatar.png',
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Tran',
      verified: false,
      posts: [],
      bio: 'Bob is a software engineer at Apple',
      avatarUrl: 'https://bob.com/avatar.png',
    },
    {
      id: 3,
      firstName: 'Charlie',
      lastName: 'Le',
      verified: true,
      posts: [],
      bio: 'Charlie is a software engineer at Microsoft',
      avatarUrl: 'https://charlie.com/avatar.png',
    },
  ];

  findAll(): Author[] {
    return this.authors;
  }

  findOneById(id: number): Author | null {
    return this.authors.find((author) => author.id === id) || null;
  }
}

import { Injectable } from '@nestjs/common';
import { Post } from 'src/models/post.model';

@Injectable()
export class PostsService {
  private posts: Post[] = [
    {
      id: 1,
      title: 'Intro to GraphQL',
      votes: 10,
      author: {
        id: 1,
        firstName: 'Alice',
        lastName: 'Nguyen',
        bio: 'Alice is a software engineer at Google',
        avatarUrl: 'https://alice.com/avatar.png',
        verified: false,
        posts: [],
      },
      category: {
        id: 1,
        name: 'Technology',
        post: [], // thêm dòng này
      },
      comments: [],
      likes: [],
    },
    {
      id: 2,
      title: 'NestJS + Apollo Integration',
      votes: 25,
      author: {
        id: 2,
        lastName: 'Tran',
        firstName: 'Bob',
        bio: 'Bob is a software engineer at Apple',
        avatarUrl: 'https://bob.com/avatar.png',
        verified: false,
        posts: [],
      },
      category: {
        id: 2,
        name: 'Programming',
        post: [],
      },
      comments: [],
      likes: [],
    },
    {
      id: 3,
      title: 'TypeScript Deep Dive',
      votes: 8,
      author: {
        id: 2,
        lastName: 'Bob',
        firstName: 'Tran',
        bio: 'Bob is a software engineer at Apple',
        avatarUrl: 'https://bob.com/avatar.png',
        verified: false,
        posts: [],
      },
      category: {
        id: 2,
        name: 'Programming',
        post: [],
      },
      comments: [],
      likes: [],
    },
    {
      id: 4,
      title: 'GraphQL Resolvers Explained',
      votes: 12,
      author: {
        id: 3,
        firstName: 'Charlie',
        lastName: 'Le',
        bio: 'Charlie is a software engineer at Microsoft',
        avatarUrl: 'https://charlie.com/avatar.png',
        verified: false,
        posts: [],
      },
      category: {
        id: 3,
        name: 'Technology',
        post: [],
      },
      comments: [],
      likes: [],
    },
    {
      id: 5,
      title: 'Working with Decorators',
      votes: 18,
      author: {
        id: 4,
        firstName: 'David',
        lastName: 'Lee',
        bio: 'David is a software engineer at Microsoft',
        avatarUrl: 'https://david.com/avatar.png',
        verified: false,
        posts: [],
      },
      category: {
        id: 4,
        name: 'Programming',
        post: [],
      },
      comments: [],
      likes: [],
    },
    {
      id: 6,
      title: 'Working with Decorators',
      votes: 18,
      author: {
        id: 5,
        firstName: 'Eve',
        lastName: 'Smith',
        bio: 'Eve is a software engineer at Amazon',
        avatarUrl: 'https://eve.com/avatar.png',
        verified: false,
        posts: [],
      },
      category: {
        id: 5,
        name: 'Technology',
        post: [],
      },
      comments: [],
      likes: [],
    },
  ];

  private postAuthorMap = new Map<number, number>([
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 3],
  ]);

  findAll(filter: { authorId?: number }): Post[] {
    if (filter.authorId) {
      const authorId = filter.authorId;

      const postIds = Array.from(this.postAuthorMap.entries())
        .filter(([_, aId]) => aId === authorId)
        .map(([pId]) => pId);

      return this.posts.filter((post) => postIds.includes(post.id));
    }

    return this.posts;
  }

  findOneById(id: number): Post | undefined {
    return this.posts.find((post) => post.id === id);
  }
}

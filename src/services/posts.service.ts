import { Injectable } from '@nestjs/common';
import { Post } from 'src/models/post.model';

@Injectable()
export class PostsService {
  private posts: Post[] = [
    { id: 1, title: 'Intro to GraphQL', votes: 10 },
    { id: 2, title: 'NestJS + Apollo Integration', votes: 25 },
    { id: 3, title: 'TypeScript Deep Dive', votes: 8 },
    { id: 4, title: 'GraphQL Resolvers Explained', votes: 12 },
    { id: 5, title: 'Working with Decorators', votes: 18 },
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

import { Injectable } from '@nestjs/common';
import { Post } from 'src/models/post.model';

@Injectable()
export class PostsService {
  private posts: Post[] = [
    {
      id: 1,
      title: 'Understanding Dependency Injection in NestJS',
      votes: 120,
      author: {
        id: 1,
        firstName: 'Phuc',
        lastName: 'Dang',
        bio: 'Backend developer passionate about scalable architecture.',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        verified: true,
        posts: [],
      },
      category: { id: 1, name: 'Backend', posts: [] },
      comments: [
        {
          id: 1,
          content: 'Great explanation! Helped me a lot.',
          user: {
            id: 3,
            name: 'Tuan',
            email: 'tuan@example.com',
            comments: [],
            likes: [],
          },
          post: null,
          createdAt: new Date('2025-10-10'),
        },
      ],
      likes: [
        {
          id: 1,
          user: {
            id: 4,
            name: 'Anh',
            email: 'anh@example.com',
            comments: [],
            likes: [],
          },
        },
      ],
    },
    {
      id: 2,
      title: 'Mastering GraphQL Relationships in NestJS',
      votes: 95,
      author: {
        id: 2,
        firstName: 'Minh',
        lastName: 'Nguyen',
        bio: 'GraphQL enthusiast and open-source contributor.',
        avatarUrl: 'https://i.pravatar.cc/150?img=2',
        verified: true,
        posts: [],
      },
      category: { id: 2, name: 'GraphQL', posts: [] },
      comments: [
        {
          id: 2,
          content: 'Exactly what I needed, thank you!',
          user: {
            id: 5,
            name: 'Khoa',
            email: 'khoa@example.com',
            comments: [],
            likes: [],
          },
          post: null,
          createdAt: new Date('2025-10-12'),
        },
      ],
      likes: [
        {
          id: 2,
          user: {
            id: 6,
            name: 'Huy',
            email: 'huy@example.com',
            comments: [],
            likes: [],
          },
        },
      ],
    },
    {
      id: 3,
      title: 'How to Handle File Uploads in NestJS and GraphQL',
      votes: 73,
      author: {
        id: 3,
        firstName: 'Linh',
        lastName: 'Pham',
        bio: 'Building APIs with love and best practices.',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
        verified: true,
        posts: [],
      },
      category: { id: 3, name: 'API', posts: [] },
      comments: [],
      likes: [],
    },
    {
      id: 4,
      title: 'Optimizing Prisma Queries for Better Performance',
      votes: 62,
      author: {
        id: 4,
        firstName: 'Anh',
        lastName: 'Tran',
        bio: 'Fullstack developer and performance nerd.',
        avatarUrl: 'https://i.pravatar.cc/150?img=4',
        verified: false,
        posts: [],
      },
      category: { id: 4, name: 'Database', posts: [] },
      comments: [
        {
          id: 3,
          content: 'Nice tips! Query batching was new to me.',
          user: {
            id: 7,
            name: 'Bao',
            email: 'bao@example.com',
            comments: [],
            likes: [],
          },
          post: null,
          createdAt: new Date('2025-10-14'),
        },
      ],
      likes: [
        {
          id: 3,
          user: {
            id: 8,
            name: 'Thao',
            email: 'thao@example.com',
            comments: [],
            likes: [],
          },
        },
        {
          id: 4,
          user: {
            id: 9,
            name: 'Son',
            email: 'son@example.com',
            comments: [],
            likes: [],
          },
        },
      ],
    },
    {
      id: 5,
      title: 'Implementing Authentication with JWT in NestJS',
      votes: 180,
      author: {
        id: 5,
        firstName: 'Hanh',
        lastName: 'Nguyen',
        bio: 'Security and backend systems specialist.',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
        verified: true,
        posts: [],
      },
      category: { id: 5, name: 'Security', posts: [] },
      comments: [],
      likes: [],
    },
    {
      id: 6,
      title: 'Deploying NestJS to Docker and AWS',
      votes: 142,
      author: {
        id: 6,
        firstName: 'Khang',
        lastName: 'Pham',
        bio: 'Cloud-native architect focusing on deployment automation.',
        avatarUrl: 'https://i.pravatar.cc/150?img=6',
        verified: true,
        posts: [],
      },
      category: { id: 6, name: 'DevOps', posts: [] },
      comments: [
        {
          id: 4,
          content: 'Would love to see CI/CD integration next!',
          user: {
            id: 10,
            name: 'Trang',
            email: 'trang@example.com',
            comments: [],
            likes: [],
          },
          post: null,
          createdAt: new Date('2025-10-13'),
        },
      ],
      likes: [],
    },
    {
      id: 7,
      title: 'Error Handling Strategies in NestJS',
      votes: 88,
      author: {
        id: 7,
        firstName: 'Thao',
        lastName: 'Do',
        bio: 'Writing about clean code and error handling.',
        avatarUrl: 'https://i.pravatar.cc/150?img=7',
        verified: false,
        posts: [],
      },
      category: { id: 1, name: 'Backend', posts: [] },
      comments: [],
      likes: [],
    },
    {
      id: 8,
      title: 'How to Use Interceptors in NestJS Effectively',
      votes: 54,
      author: {
        id: 8,
        firstName: 'Bao',
        lastName: 'Ho',
        bio: 'Software engineer exploring design patterns.',
        avatarUrl: 'https://i.pravatar.cc/150?img=8',
        verified: true,
        posts: [],
      },
      category: { id: 7, name: 'Architecture', posts: [] },
      comments: [],
      likes: [],
    },
    {
      id: 9,
      title: 'Unit Testing Services in NestJS with Jest',
      votes: 110,
      author: {
        id: 9,
        firstName: 'Nhi',
        lastName: 'Tran',
        bio: 'Loves testing and quality assurance.',
        avatarUrl: 'https://i.pravatar.cc/150?img=9',
        verified: false,
        posts: [],
      },
      category: { id: 8, name: 'Testing', posts: [] },
      comments: [
        {
          id: 5,
          content: 'This made testing way easier to understand!',
          user: {
            id: 11,
            name: 'Dat',
            email: 'dat@example.com',
            comments: [],
            likes: [],
          },
          post: null,
          createdAt: new Date('2025-10-10'),
        },
      ],
      likes: [],
    },
    {
      id: 10,
      title: 'Using Pipes for Data Validation in NestJS',
      votes: 61,
      author: {
        id: 10,
        firstName: 'Trang',
        lastName: 'Vu',
        bio: 'Frontend engineer passionate about backend logic.',
        avatarUrl: 'https://i.pravatar.cc/150?img=10',
        verified: true,
        posts: [],
      },
      category: { id: 9, name: 'Validation', posts: [] },
      comments: [],
      likes: [],
    },
    {
      id: 11,
      title: 'Creating Custom Decorators in NestJS',
      votes: 49,
      author: {
        id: 11,
        firstName: 'Son',
        lastName: 'Le',
        bio: 'Loves abstraction and reusable design.',
        avatarUrl: 'https://i.pravatar.cc/150?img=11',
        verified: false,
        posts: [],
      },
      category: { id: 10, name: 'Advanced', posts: [] },
      comments: [],
      likes: [],
    },
  ];

  findAll(): Post[] {
    return this.posts;
  }

  findAuthorPosts(authorId: number): Post[] | null {
    return this.posts.filter((post) => post.author.id === authorId) || null;
  }

  findById(id: number): Post | null {
    return this.posts.find((post) => post.id === id) || null;
  }

  LikesInPost(postId: number) {
    return this.posts.find((post) => post.id === postId)?.likes || [];
  }
}

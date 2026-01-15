import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Post, Prisma } from '../../../generated/prisma';
import {
  BaseRepository,
  PaginationParams,
  PaginationResult,
} from '../../common/base.repository';
import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS } from '../../lib/key';
import { GraphQLContext } from '../../interface/graphql.context';

@Injectable()
export class PostsService extends BaseRepository<Post, Prisma.PostDelegate> {
  constructor(
    prisma: PrismaService,
    // @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(UPSTASH_REDIS) private readonly upstashRedis: Redis,
  ) {
    super(prisma.post, 'PostsService');
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return await this.findUnique(
      { slug },
      {
        include: {
          author: true,
          category: true,
        },
      },
    );
  }

  async findBySlugOrFail(slug: string) {
    return this.findOneOrFail({ slug });
  }

  async findPublishedPosts(params?: PaginationParams) {
    return this.findManyPaginated({
      where: {
        isPublished: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...params,
    });
  }

  async searchPosts(searchTerm: string, params?: PaginationParams) {
    return this.findManyPaginated({
      where: {
        OR: [
          { title: { contains: searchTerm }, mode: 'insensitive' },
          { description: { contains: searchTerm }, mode: 'insensitive' },
        ],
        isPublished: true,
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
      ...params,
    });
  }

  async postPaginated(
    params: PaginationParams & Prisma.SelectSubset<any, any>,
  ) {
    return this.findManyPaginated(params);
  }

  async findPriorityPosts(limit: number = 10) {
    return this.findAll({
      where: {
        isPublished: true,
        isDeleted: false,
        isPriority: true,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    // console.log({ data });
    return await this.create(data);
  }

  async updatePost(
    id: string,
    data: Prisma.PostUpdateInput,
    context: GraphQLContext,
  ): Promise<Post> {
    const post = await this.findById(id);

    const { req } = context;

    const headers = req.headers['authorization']?.split(' ')[1];

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // if (post.authorId !== context.req.user.id) {
    //   throw new ForbiddenException('You are not the owner of this post');
    // }

    return await this.update(id, { data });
  }

  async incrementViews(id: string, identifier: string) {
    const cacheKey = `blog:${id}:view:${identifier}`;

    const hasViewed = await this.upstashRedis.get(cacheKey);

    // console.log('Cache check:', { cacheKey, hasViewed });

    if (hasViewed) {
      const blog = await this.findById(id);

      // console.log('Already viewed, returning current views:', blog?.views);

      return blog;
    }

    await this.upstashRedis.set(cacheKey, identifier, { ex: 3600 });

    const updatedPost = await this.update(id, {
      data: {
        views: { increment: 1 },
      },

      include: {
        author: true,
        category: true,
      },
    });

    console.log('View incremented:', updatedPost?.views);

    return updatedPost;
  }

  async deletePost(id: string): Promise<Post> {
    return await this.delete({ where: { id } });
  }
}

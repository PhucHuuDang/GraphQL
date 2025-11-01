import { Module } from '@nestjs/common';
import { PostModule } from 'src/posts/post.module';
import { PostsService } from 'src/posts/post.service';
import { AuthorsResolver } from 'src/resolver/author.resolver';
import { AuthorsService } from 'src/services/authors.service';

@Module({
  providers: [AuthorsResolver, AuthorsService],
  imports: [PostModule],
  exports: [AuthorsResolver],
})
export class AuthorsModule {}

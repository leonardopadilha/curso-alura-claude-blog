import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { TagsController } from './tags.controller.js';

@Module({
  controllers: [PostsController, CommentsController, TagsController],
  providers: [PostsService, CommentsService],
})
export class PostsModule {}

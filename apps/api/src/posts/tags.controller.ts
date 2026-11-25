import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  listTagsQuerySchema,
  tagListSchema,
  type ListTagsQuery,
  type TagList,
} from './post.schema.js';
import { PostsService } from './posts.service.js';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista as tags mais usadas (sugestões de filtro do feed)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Tags e quantidade de posts', standardSchema: tagListSchema })
  list(@Query({ schema: listTagsQuerySchema }) query: ListTagsQuery): Promise<TagList> {
    return this.postsService.popularTags(query);
  }
}

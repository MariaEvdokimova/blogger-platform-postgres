import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBasicAuth, ApiParam } from "@nestjs/swagger";
import { BlogsQueryRepository } from "../infrastructure/query/blogs.query-repository";
import { PostsQueryRepository } from "../../posts/infrastructure/query/posts.query-repository";
import { PostsService } from "../../posts/application/posts.service";
import { CreateBlogInputDto } from "./input-dto/blogs.input-dto";
import { BlogViewDto } from "./view-dto/blogs.view-dto";
import { CreatePostInBlogInputDto } from "./input-dto/post-in-blog.input-dto";
import { PostViewDto } from "../../posts/api/view-dto/posts.view-dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { GetBlogsQueryParams } from "./input-dto/get-blogs-query-params.input-dto";
import { GetPostsQueryParams } from "../../posts/api/input-dto/get-posts-query-params.input-dto";
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetBlogsQuery } from "../application/queries/get-blogs.query";
import { GetBlogByIdQuery } from "../application/queries/get-blog-by-id.query";
import { GetPostsInBlogQuery } from "../application/queries/get-posts-in-blog.query";
import { DeleteBlogCommand } from "../application/usecases/delete-blog.usecase";
import { CreateBlogCommand } from "../application/usecases/create-blog.usecase";
import { BasicAuthGuard } from "../../../../modules/user-accounts/guards/basic/basic-auth.guard";
import { UpdateBlogCommand } from "../application/usecases/update-blog.usecase";
import { OptionalJwtGuard } from "src/modules/user-accounts/guards/bearer/jwt-optional.quard";
import { UserId } from "src/modules/user-accounts/guards/decorators/param/user-id.decorator";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,    
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
 
  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery( query ));
  }
 
  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getBlog(@Param('id') id: string): Promise<BlogViewDto> {
    return this.queryBus.execute( new GetBlogByIdQuery( id ));
  }
  
  @UseGuards(OptionalJwtGuard)
  @ApiParam({ name: 'blogId' }) //для сваггера
  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId') blogId: string, 
    @Query() query: GetPostsQueryParams,
    @UserId() userId: string
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute( new GetPostsInBlogQuery( blogId, query, userId ));
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute( new CreateBlogCommand( body ));
    return this.blogsQueryRepository.getByIdMapToViewOrNotFoundFail(blogId);
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'blogId' }) //для сваггера
  @Post(':blogId/posts')
  async createPostInBlog(@Param('blogId') blogId: string, @Body() body: CreatePostInBlogInputDto): Promise<PostViewDto> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail( blogId );
    const postId = await this.postsService.createPost({ ...body, blogId: blog._id.toString()}, blog);
 
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
  
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id' }) //для сваггера
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto): Promise<void> {
    return this.commandBus.execute( new UpdateBlogCommand( id, body ));
  }
 
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute( new DeleteBlogCommand( id ));
  }
}

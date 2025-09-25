import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { PostsQueryRepository } from "../infrastructure/query/posts.query-repository";
import { ApiBasicAuth, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { CreatePostInputDto } from "./input-dto/posts.input-dto";
import { PostViewDto } from "./view-dto/posts.view-dto";
import { BlogsQueryRepository } from "../../blogs/infrastructure/query/blogs.query-repository";
import { UpdatePostDomainDto } from "../dto/update-post.dto";
import { GetPostsQueryParams } from "./input-dto/get-posts-query-params.input-dto";
import { CommentViewDto } from "../../comments/api/view-dto/comments.view-dto";
import { GetCommentsQueryParams } from "../../comments/api/input-dto/get-comments-query-params.input-dto";
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetPostsQuery } from "../application/queries/get-posts.query";
import { GetPostByIdQuery } from "../application/queries/get-post-by-id.query";
import { GetCommentsPostByIdQuery } from "../application/queries/get-comments-by-post-id.query";
import { JwtAuthGuard } from "../../../user-accounts/guards/bearer/jwt-auth.guard";
import { DeletePostCommand } from "../application/usecases/delete-post.usecase";
import { CreatePostCommand } from "../application/usecases/create-post.usecase";
import { UpdatePostCommand } from "../application/usecases/update-post.usecase";
import { CommentInputDto } from "../../comments/api/input-dto/comment.input-dto";
import { ExtractUserFromRequest } from "../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator";
import { UserContextDto } from "../../../user-accounts/dto/user-context.dto";
import { CreateCommentByPostIdCommand } from "../application/usecases/create-comment-by-post-id.usecase";
import { GetCommenByIdQuery } from "../../comments/application/queries/get-comment-by-id.query";
import { UpdatePostLikeStatusInputDto } from "./input-dto/post-like-status-update.input-dto";
import { UpdatePostLikeStatusCommand } from "../application/usecases/update-post-like-status.usecase";
import { BasicAuthGuard } from "../../../user-accounts/guards/basic/basic-auth.guard";
import { UserId } from "../../../user-accounts/guards/decorators/param/user-id.decorator";
import { OptionalJwtGuard } from "../../../user-accounts/guards/bearer/jwt-optional.quard";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
 
  @UseGuards(OptionalJwtGuard)
  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
    @UserId() userId: number
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute( new GetPostsQuery( query, userId ));
  }
 
  @UseGuards(OptionalJwtGuard)
  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getPost(
    @Param('id') id: string,
    @UserId() userId: number
  ): Promise<PostViewDto> {
    return this.queryBus.execute( new GetPostByIdQuery( Number(id), userId ));
  }

  @UseGuards(OptionalJwtGuard)
  @ApiParam({ name: 'postId' }) //для сваггера
  @Get(':postId/comments')
  async getPostComments(
    @Param('postId') postId: string, 
    @Query() query: GetCommentsQueryParams,
    @UserId() userId: number
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute( new GetCommentsPostByIdQuery( Number(postId), query, userId ));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuth')
  @ApiParam({ name: 'postId' }) //для сваггера
  @Post(':postId/comments')
  async createPostComment(
    @Param('postId') postId: string, 
    @Body() body: CommentInputDto, 
    @ExtractUserFromRequest() user: UserContextDto
  ): Promise<CommentViewDto> {
    await this.postsQueryRepository.getByIdOrNotFoundFail( Number(postId) );
    const commentId = await this.commandBus.execute(new CreateCommentByPostIdCommand( body, Number(postId), Number(user.id))); 
    return this.queryBus.execute( new GetCommenByIdQuery( commentId, Number(user.id) ));
  }
  
  @ApiBearerAuth('JwtAuth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'postId' }) //для сваггера
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId') postId: string, 
    @Body() body: UpdatePostLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto
  ): Promise<void> {
    return this.commandBus.execute( new UpdatePostLikeStatusCommand( Number(postId), body, Number(user.id) ));
  }

  /*
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail( body.blogId );
    const postId = await this.commandBus.execute(new CreatePostCommand( body, blog)); 
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id' }) //для сваггера
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() body: UpdatePostDomainDto): Promise<void> {
    return this.commandBus.execute( new UpdatePostCommand( id, body ));
  }
 
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute( new DeletePostCommand( id ));
  }
*/
}

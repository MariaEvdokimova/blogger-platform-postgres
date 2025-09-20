import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { Blog, BlogSchema } from './blogs/domain/mongoose/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query';
import { GetPostsInBlogQueryHandler } from './blogs/application/queries/get-posts-in-blog.query';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { LikeComment, LikeCommentSchema } from './comments/domain/likes.entity';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './comments/application/usecases/update-comment-like-status.usecase';
import { GetCommentsByPostIdQueryHandler } from './comments/application/queries/get-comments-by-post-id.query';
import { GetCommentsPostByIdQueryHandler } from './posts/application/queries/get-comments-by-post-id.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { CreateCommentByPostIdUseCase } from './posts/application/usecases/create-comment-by-post-id.usecase';
import { UpdatePostLikeStatusUseCase } from './posts/application/usecases/update-post-like-status.usecase';
import { LikePost, LikePostSchema } from './posts/domain/likes.entity';
import { PostLikesRepository } from './posts/infrastructure/posts-likes.repository';
import { CommentLikesRepository } from './comments/infrastructure/comment-likes.repository';
import { BlogsFactory as BlogsFactoryM } from './blogs/application/factories/mongoose/blogs.factory';
import { CommentFactory } from './comments/application/factories/comment.factory';
import { PostLikeStatusFactory } from './posts/application/factories/post-like-status.factory';
import { CommentLikeStatusFactory } from './comments/application/factories/comment-like-status.factory';
import { UsersRepository } from '../user-accounts/infrastructure/users.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { PostsFactory as PostsFactoryM } from './posts/application/factories/mongoose/posts.factory';
import { User, UserSchema } from '../user-accounts/domain/mongoose/user.entity';
import { PostsLikesQueryRepository } from './posts/infrastructure/query/post-likes.query.repository';
import { CommentsLikesQueryRepository } from './comments/infrastructure/query/comment-likes.query.repository';
import { BlogsSuperAdminController } from './blogs/api/blogs-super-admin.controller';
import { Post, PostSchema } from './posts/domain/mongoose/post.entity';
import { BlogsFactory } from './blogs/application/factories/blogs.factory';
import { PostsFactory } from './posts/application/factories/posts.factory';

const commandHandlers = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  DeletePostUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  CreateCommentByPostIdUseCase,
  UpdatePostLikeStatusUseCase,
];

const queryHandlers = [
  GetBlogsQueryHandler,
  GetBlogByIdQueryHandler,
  GetPostsInBlogQueryHandler,
  GetCommentByIdQueryHandler,
  GetCommentsByPostIdQueryHandler,
  GetCommentsPostByIdQueryHandler,
  GetPostsQueryHandler,
  GetPostByIdQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserAccountsModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: LikeComment.name, schema: LikeCommentSchema },
      {name: LikePost.name, schema: LikePostSchema },
      { name: User.name, schema: UserSchema },
   ]),
  ],
  controllers: [
    CommentsController, 
    PostsController,
    BlogsController,
    BlogsSuperAdminController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    CommentsQueryRepository,
    CommentsRepository,
    CommentLikesRepository,
    CommentsLikesQueryRepository,
    PostsQueryRepository,
    PostsRepository,
    PostLikesRepository,
    PostsLikesQueryRepository,
    BlogsQueryRepository,
    BlogsRepository,
    BlogsFactoryM, //!!!!!!!!!!!!!!!!
    BlogsFactory,
    CommentFactory,
    PostsFactoryM, //!!!!!!!!!!!!!!!!!!!!!!
    PostsFactory,
    PostLikeStatusFactory,
    CommentLikeStatusFactory,
    UsersRepository,
  ],
})
export class BloggersPlatformModule {}

import request from 'supertest';
import { HttpStatus, INestApplication } from "@nestjs/common";
import { UsersTestManager } from "./helpers/users-test-manager";
import { initSettings } from "./helpers/init-settings";
import { JwtService } from "@nestjs/jwt";
import { deleteAllData } from "./helpers/delete-all-data";
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { PostsTestManager } from './helpers/posts-test-manager';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { LikeStatus } from '../src/modules/bloggers-platform/posts/domain/extendedLikesInfo.entity';

describe('posts', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );
    app = result.app;
    userTestManger = result.userTestManger;
    blogsTestManager = result.blogsTestManager;
    postsTestManager = result.postsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });
  
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should create post', async () => {
    const blog = await blogsTestManager.createBlog();
    const post = await postsTestManager.createPost( blog.id);
    const tokens = await userTestManger.createAndLoginSeveralUsers(4);

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${ post.id }/like-status`)
      .auth(tokens[0].accessToken, { type: 'bearer' })
      .send({likeStatus: LikeStatus.Like})
      .expect(HttpStatus.NO_CONTENT);
      
      const postWithLike1 = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/posts/${ post.id }`)
      .auth(tokens[0].accessToken, { type: 'bearer' })
      .send()
      .expect(HttpStatus.OK);

      expect(postWithLike1.body.extendedLikesInfo.myStatus).toEqual('Like');
      expect(postWithLike1.body.extendedLikesInfo.newestLikes.length).toEqual(1);
      //console.log('postWithLike1 ', postWithLike1.body.extendedLikesInfo);

      //=========user2=====================      
         
      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/posts/${ post.id }/like-status`)
        .auth(tokens[1].accessToken, { type: 'bearer' })
        .send({likeStatus: LikeStatus.Like})
        .expect(HttpStatus.NO_CONTENT);
      
      const postWithLike2 = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/posts/${ post.id }`)
      .auth(tokens[1].accessToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);

        
      expect(postWithLike2.body.extendedLikesInfo.myStatus).toEqual('Like');
      expect(postWithLike2.body.extendedLikesInfo.newestLikes.length).toEqual(2);
      //console.log('postWithLike2 ', postWithLike2.body.extendedLikesInfo);

      // =====================user3 
      await request(app.getHttpServer())
        .put(`/${GLOBAL_PREFIX}/posts/${ post.id }/like-status`)
        .auth(tokens[2].accessToken, { type: 'bearer' })
        .send({likeStatus: LikeStatus.Dislike})
        .expect(HttpStatus.NO_CONTENT);
      
      const postWithLike3 = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/posts/${ post.id }`)
      .auth(tokens[2].accessToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);

      
      expect(postWithLike3.body.extendedLikesInfo.myStatus).toEqual('Dislike');
      expect(postWithLike3.body.extendedLikesInfo.newestLikes.length).toEqual(2);
      //console.log('postWithLike3 ', postWithLike3.body.extendedLikesInfo);
  });

  it('should return users info while "me" request with correct accessTokens', async () => {
    
  });

});

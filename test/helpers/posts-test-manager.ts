import { HttpStatus, INestApplication } from "@nestjs/common";
import request from 'supertest';
import { GLOBAL_PREFIX } from "../../src/setup/global-prefix.setup";
import { PostViewDto } from "../../src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto";
import { CreatePostInputDto } from "src/modules/bloggers-platform/posts/api/input-dto/posts.input-dto";

export class PostsTestManager {
  constructor(private app: INestApplication) {}

  async createPost(
    blogId: string,
    createModel?: CreatePostInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostViewDto> {

    const postData = {
      content:"new post content",
      shortDescription:"description",
      title:"post title"
    }

    const testPostData = { ...postData, ...createModel };

    const response = await request(this.app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/blogs/${blogId}/posts`)
        .send(testPostData)
        .auth('admin', 'qwerty')
        //.expect(statusCode);
    
    return response.body;
  }
}

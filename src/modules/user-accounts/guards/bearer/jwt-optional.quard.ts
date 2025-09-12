import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest(_, user) {
    //console.log('!!!!!!!!!!!!!!user ', user)
    return user;
  }
}

import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}

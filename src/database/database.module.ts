import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg'
import { CoreConfig } from 'src/core/core.config';
import { CoreModule } from 'src/core/core.module';

@Global()
@Module({
  imports: [CoreModule],
  providers: [
    {
      provide: 'PG_POOL',
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => {
        return new Pool({
          host: coreConfig.pgHost,
          port: coreConfig.pgPort,
          user: coreConfig.pgUser,
          password: coreConfig.pgPassword,
          database: coreConfig.pgDatebase,
          ssl: {
            rejectUnauthorized: false, // ✅ <- это обязательно для sslmode=require
          },
        });
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}

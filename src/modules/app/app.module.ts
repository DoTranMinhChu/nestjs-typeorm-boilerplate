import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import configuration from '@configs/configuration';
import { UserModule } from '@modules/user/user.module';
import { QueryPrismaMiddleware } from '@middlewares/queryPrisma.middleware';
import { AuthModule } from '@modules/auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@filters/allException.filter';
import { AuthGuard } from '@guards/auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AccountTypesGuard } from '@guards/auth/accountTypes.guard';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DB_PATH_CONFIG } from '@configs/database.config';
;

@Module({
  imports: [
    UserModule,
    AuthModule,
    JwtModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get<TypeOrmModuleOptions>(DB_PATH_CONFIG) || {};
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(
      {
        envFilePath: resolve(`./.env.${process.env['NODE_ENV']}`),
        isGlobal: true,
        load: [configuration],
      }
    )
  ],
  controllers: [
    AppController,
  ],
  providers: [AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: AccountTypesGuard
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(QueryPrismaMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {configService} from "./configuration/config.service";
import {UserModule} from "./api/user/user.module";

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
      UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

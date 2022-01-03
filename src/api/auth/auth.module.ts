import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AuthService} from "./service/auth.service";
import {JwtStrategy} from "./util/jwt.strategy";
import {JwtAuthGuard} from "./util/jwt.guard";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user/model/user.entity";
import {AuthController} from "./auth.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async(x: ConfigService) => ({secret: x.get('JWT_KEY')})
        })
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtAuthGuard
    ],
    exports: [AuthService]
})

export class AuthModule {}

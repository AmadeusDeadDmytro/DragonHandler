import {Body, Controller, Post} from "@nestjs/common";
import {AuthService} from "./service/auth.service";
import {LoginUserDto} from "./dto/login-user.dto";
import {IAuthResponse} from "../user/model/dto/auth-response.interface";
import {RegisterUserDto} from "./dto/register-user.dto";
import {IUser} from "../user/model/user.interface";

@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService) {
    }

    @Post('login')
    login(@Body() dto: LoginUserDto): Promise<IAuthResponse> {
        return this.authService.login(dto);
    }

    @Post('register')
    register(@Body() dto: RegisterUserDto): Promise<IAuthResponse> {
        return this.authService.register(dto);
    }
}

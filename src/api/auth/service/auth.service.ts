import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {SALT_ROUNDS} from "../../../configuration/user.config";
import {IUser} from "../../user/model/user.interface";
import {JwtService} from "@nestjs/jwt";
import {LoginUserDto} from "../dto/login-user.dto";
import {IAuthResponse} from "../../user/model/dto/auth-response.interface";
import {RegisterUserDto} from "../dto/register-user.dto";
import {Repository} from "typeorm";
import {User} from "../../user/model/user.entity";
import {GetUserDto} from "../../user/model/dto/get-user.dto";
import {InjectRepository} from "@nestjs/typeorm";

const bcrypt = require('bcrypt')

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ) {
    }

    async login(dto: LoginUserDto): Promise<IAuthResponse> {
        const user = await this.userRepository.findOne({ nickname: dto.nickname });
        if (!user) throw new NotFoundException();

        const match: boolean = await this.validatePassword(
            dto.password,
            user.password,
        );
        if (!match) throw new BadRequestException('Incorrect Password');

        const token = await this.generateJwt(user)

        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            accessToken: token
        };
    }

    async register(dto: RegisterUserDto): Promise<IAuthResponse> {
        if (await this.emailExists(dto.email))
            throw new BadRequestException('Email Occupied');
        if (await this.nicknameExists(dto.nickname))
            throw new BadRequestException('Nickname Occupied');

        const hashedPassword = await this.hashPassword(dto.password);
        const newUser: IUser = {
            email: dto.email,
            password: hashedPassword,
            nickname: dto.nickname,
        };

        const createdUser = this.userRepository.create(newUser);
        await this.userRepository.save(createdUser);

        const token = await this.generateJwt(createdUser)

        return {
            id: createdUser.id,
            email: createdUser.email,
            nickname: createdUser.nickname,
            accessToken: token
        };
    }

    async generateJwt(user: IUser): Promise<string> {
        return this.jwtService.signAsync({user})
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    async validatePassword(
        password: string,
        hashedPassword: string,
    ): Promise<any> {
        return bcrypt.compare(password, hashedPassword);
    }

    private async emailExists(email: string): Promise<boolean> {
        const params: GetUserDto = { email: email };
        const users = await this.userRepository.find(params);

        return users.length > 0;
    }

    private async nicknameExists(nickname: string): Promise<boolean> {
        const params: GetUserDto = { nickname: nickname };
        const users = await this.userRepository.find(params);

        return users.length > 0;
    }
}

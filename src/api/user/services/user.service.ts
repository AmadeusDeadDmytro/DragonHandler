import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { IUser } from '../model/user.interface';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { GetUserDto } from '../model/dto/get-user.dto';
import { SALT_ROUNDS } from '../../../configuration/user.config';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import {AuthService} from "../../auth/service/auth.service";
import {ILoginResponse} from "../model/dto/login-response.interface";

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService
  ) {}

  async login(dto: LoginUserDto): Promise<ILoginResponse> {
    const user = await this.userRepository.findOne({ nickname: dto.nickname });
    if (!user) throw new NotFoundException();

    const match: boolean = await this.authService.validatePassword(
      dto.password,
      user.password,
    );
    if (!match) throw new BadRequestException('Incorrect Password');

    const token = await this.authService.generateJwt(user)

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      accessToken: token
    };
  }

  async create(dto: CreateUserDto): Promise<IUser> {
    if (await this.emailExists(dto.email))
      throw new BadRequestException('Email Occupied');
    if (await this.nicknameExists(dto.nickname))
      throw new BadRequestException('Nickname Occupied');

    const hashedPassword = await this.authService.hashPassword(dto.password);
    const newUser: IUser = {
      email: dto.email,
      password: hashedPassword,
      nickname: dto.nickname,
    };

    const createdUser = this.userRepository.create(newUser);
    return this.userRepository.save(createdUser);
  }

  async getOne(id: string): Promise<IUser> {
    return this.userRepository.findOne(id);
  }

  async getAll(dto: GetUserDto): Promise<Pagination<IUser>> {
    return paginate<IUser>(this.userRepository, {
      page: dto.page,
      limit: dto.limit,
    });
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

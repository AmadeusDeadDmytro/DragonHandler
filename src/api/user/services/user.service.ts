import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from '../../auth/dto/login-user.dto';
import { IUser } from '../model/user.interface';
import { RegisterUserDto } from '../../auth/dto/register-user.dto';
import { GetUserDto } from '../model/dto/get-user.dto';
import { SALT_ROUNDS } from '../../../configuration/user.config';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import {AuthService} from "../../auth/service/auth.service";
import {IAuthResponse} from "../model/dto/auth-response.interface";
import {UpdateUserDto} from "../model/dto/update-user.dto";

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService
  ) {}

  async getOne(id: string): Promise<IUser> {
    return this.userRepository.findOne(id);
  }

  async getAll(dto: GetUserDto): Promise<Pagination<IUser>> {
    return paginate<IUser>(this.userRepository, {
      page: dto.page,
      limit: dto.limit,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<IUser> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException();

    if (dto.email && dto.email !== user.email && await this.emailExists(dto.email)) {
      throw new BadRequestException('Email Occupied');
    }
    if (dto.nickname && dto.nickname !== user.nickname && await this.nicknameExists(dto.nickname)) {
      throw new BadRequestException('Nickname Occupied');
    }

    if (dto.email) user.email = dto.email
    if (dto.nickname) user.nickname = dto.nickname
    if (dto.password) user.password = await this.authService.hashPassword(user.password)

    return this.userRepository.save(user);
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

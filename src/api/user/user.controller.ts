import {Body, Controller, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import { UserService } from './services/user.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { IUser } from './model/user.interface';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { GetUserDto } from './model/dto/get-user.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import {IAuthResponse} from "./model/dto/auth-response.interface";
import {JwtAuthGuard} from "../auth/util/jwt.guard";
import {DEFAULT_LIMIT, DEFAULT_PAGE} from "../../configuration/user.config";
import {UpdateUserDto} from "./model/dto/update-user.dto";

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Put('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<IUser>{
    return this.userService.update(id, dto)
  }

  @Get('getOne/:id')
  getOne(@Param('id') id: string): Promise<IUser>{
    return this.userService.getOne(id);
  }

  @Get('getAll')
  getAll(@Body() dto: GetUserDto): Promise<Pagination<IUser>> {
    // todo - add default pagination middleware
    dto.page = dto.page ?? DEFAULT_PAGE
    dto.limit = dto.limit ?? DEFAULT_LIMIT

    return this.userService.getAll(dto);
  }
}

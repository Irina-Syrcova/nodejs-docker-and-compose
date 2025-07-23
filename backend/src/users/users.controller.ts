import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  profile(@Req() req) {
    return this.usersService.findById(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  async updateMyProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @UseGuards(JwtGuard)
  @Get('me/wishes')
  async profileWithWishes(@Req() req) {
    return this.usersService.getMyWishes(req.user.username);
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async userByName(@Param('username') username: string) {
    return this.usersService.getUser(username);
  }

  @UseGuards(JwtGuard)
  @Get(':username/wishes')
  async userByNameWithWishes(@Param('username') username: string) {
    return this.usersService.getUserWithWishes(username);
  }

  @UseGuards(JwtGuard)
  @Post('find')
  async findUser(@Body() searchDto: SearchUserDto) {
    return this.usersService.findMany(searchDto);
  }
}

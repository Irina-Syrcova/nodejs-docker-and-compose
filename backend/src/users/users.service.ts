import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SearchUserDto } from './dto/search-user.dto';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    const { password, ...result } = user;
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException(
          'Пользователь с таким email уже зарегистрирован',
        );
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameExists = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (usernameExists) {
        throw new ConflictException(
          'Пользователь с таким username уже зарегистрирован',
        );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    await this.usersRepository.save(updatedUser);
    return this.usersRepository.findOne({
      where: { username: updateUserDto.username },
      select: [
        'id',
        'username',
        'about',
        'email',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  getMyWishes(username: string) {
    return this.wishesRepository.find({
      where: { owner: { username: username } },
      relations: {
        offers: true,
        owner: true,
      },
    });
  }

  getUser(username: string) {
    return this.usersRepository.findOne({
      where: {
        username: username,
      },
      select: ['id', 'username', 'about', 'avatar', 'createdAt', 'updatedAt'],
    });
  }

  getUserWithWishes(username: string) {
    return this.wishesRepository.find({
      where: { owner: { username: username } },
      relations: {
        offers: true,
        owner: true,
      },
    });
  }

  async findMany(dto: SearchUserDto) {
    const { query } = dto;
    const user = this.usersRepository.find({
      where: [{ username: query }, { email: query }],
      select: [
        'id',
        'username',
        'about',
        'avatar',
        'createdAt',
        'updatedAt',
        'email',
      ],
    });

    return user;
  }
}

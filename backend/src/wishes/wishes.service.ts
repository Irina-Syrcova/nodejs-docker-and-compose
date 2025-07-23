import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, owner: User) {
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner,
    });

    await this.wishesRepository.save(wish);

    return {};
  }

  findAll(): Promise<Wish[]> {
    return this.wishesRepository.find();
  }

  findOne(id: number) {
    return this.wishesRepository.findOne({
      where: {
        id,
      },
      relations: { owner: true, offers: true },
    });
  }

  async update(id: number, updateWishDto: UpdateWishDto, ownerId: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id: id, owner: { id: ownerId } },
    });

    if (!wish) {
      throw new ForbiddenException('Вы можете изменять только свои подарки');
    }

    if (updateWishDto.price && wish.raised > 0) {
      throw new ForbiddenException(
        'Нельзя изменять стоимость подарка, если уже есть желающие скинуться',
      );
    }

    const updatedWish = this.wishesRepository.merge(wish, updateWishDto);
    await this.wishesRepository.save(updatedWish);
    return {};
  }

  async remove(id: number, ownerId: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id: id, owner: { id: ownerId } },
    });

    if (!wish) {
      throw new ForbiddenException('Вы можете удалять только свои подарки');
    }

    await this.wishesRepository.remove(wish);
    return {};
  }

  findLast() {
    return this.wishesRepository.find({
      relations: { owner: true, offers: true },
      select: {
        owner: {
          id: true,
          username: true,
          about: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
        offers: true,
      },
    });
  }

  findTop() {
    return this.wishesRepository.find({
      relations: ['owner', 'offers'],
      select: {
        owner: {
          id: true,
          username: true,
          about: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
        offers: true,
      },
      order: {
        copied: 'DESC',
      },
      take: 20,
    });
  }

  async copyWish(wishId: number, user: User) {
    const originalWish = await this.wishesRepository.findOneBy({ id: wishId });

    await this.wishesRepository.increment({ id: wishId }, 'copied', 1);

    const wishCopy = this.wishesRepository.create({
      ...originalWish,
      id: undefined,
      raised: 0,
      copied: 0,
      owner: user,
      offers: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.wishesRepository.save(wishCopy);

    return {};
  }
}

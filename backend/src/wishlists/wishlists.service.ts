import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, owner: User) {
    const items = await this.wishesRepository.find({
      where: {
        id: In(createWishlistDto.itemsId),
      },
    });
    const wishlist = this.wishlistsRepository.create({
      ...createWishlistDto,
      items,
      owner,
    });
    await this.wishlistsRepository.save(wishlist);
    return wishlist;
  }

  findAll() {
    return this.wishlistsRepository.find({
      relations: {
        items: true,
        owner: true,
      },
    });
  }

  findOne(id: number) {
    return this.wishlistsRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async update(id: number, updateWishlistDto: UpdateWishlistDto, owner: User) {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id, owner: { id: owner.id } },
    });

    if (!wishlist) {
      throw new ForbiddenException('Вы можете изменять только свой вишлист');
    }

    const items = await this.wishesRepository.find({
      where: {
        id: In(updateWishlistDto.itemsId),
      },
    });

    const updatedWishlist = this.wishlistsRepository.create({
      ...updateWishlistDto,
      items,
      owner,
    });

    return this.wishesRepository.save(updatedWishlist);
  }

  async remove(id: number, owner: User) {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id, owner: { id: owner.id } },
    });

    if (!wishlist) {
      throw new ForbiddenException('Вы можете изменять только свой вишлист');
    }

    return this.wishlistsRepository.remove(wishlist);
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    const item = await this.wishesRepository.findOne({
      where: { id: createOfferDto.itemId },
      relations: {
        owner: true,
        offers: true,
      },
    });

    if (item.owner.id === user.id) {
      throw new ForbiddenException(
        'Hельзя вносить деньги на собственные подарки',
      );
    }

    if (item.price === item.raised) {
      throw new ForbiddenException(
        'Нельзя скинуться на подарки, на которые уже собраны деньги.',
      );
    }

    if (createOfferDto.amount > item.price - item.raised) {
      throw new ForbiddenException(
        'Сумма собранных средств не может превышать стоимость подарка.',
      );
    }
    const offer = this.offersRepository.create({
      ...createOfferDto,
      user,
      item,
    });

    await this.wishesRepository.increment(
      { id: item.id },
      'raised',
      createOfferDto.amount,
    );

    await this.offersRepository.save(offer);

    return {};
  }

  findAll() {
    return this.offersRepository.find({
      relations: {
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.offersRepository.findOne({
      where: { id: id },
      relations: {
        item: true,
        user: true,
      },
    });
  }

  // update(id: number, updateOfferDto: UpdateOfferDto) {
  //   return `This action updates a #${id} offer`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} offer`;
  // }
}

import { PartialType } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  name?: string;
  link?: string;
  image?: string;
  price?: number;
  description?: string;
}

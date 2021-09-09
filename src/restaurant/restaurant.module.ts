import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantResolver } from './restaurant.resolver';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantResolver, RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}

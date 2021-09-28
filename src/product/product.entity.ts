import { ObjectType, Field } from '@nestjs/graphql';
import { Media } from 'src/media/media.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@ObjectType()
@Entity()
export class Product {
  @Field()
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  price: string;

  @Field()
  @Column()
  weight: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, { eager: true })
  @JoinColumn({ name: 'restaurant' })
  restaurant: Restaurant;

  @Field(() => Media)
  @ManyToOne(() => Media, { eager: true })
  @JoinColumn({ name: 'image' })
  image: Media;
}

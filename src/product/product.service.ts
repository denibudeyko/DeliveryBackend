import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindByKeyInput,
  FindByResCatCombInput,
} from 'src/category/category.dto';
import { CategoryService } from 'src/category/category.service';
import {
  getGeneralResponse,
  GraphqlRequestParams,
} from 'src/constants/GraphqlGeneralTypes';
import {
  RestaurantCategoryService,
  RestaurantService,
} from 'src/restaurant/restaurant.service';
import { Repository } from 'typeorm';
import {
  AddProductInput,
  GraphqlGettingProducts,
  UpdateProductInput,
} from './product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private categoryService: CategoryService,
    private restaurantCategoryService: RestaurantCategoryService,
    private restaurantService: RestaurantService,
  ) {}

  async find(data: GraphqlRequestParams): Promise<GraphqlGettingProducts> {
    const { limit, offset } = data;
    const items = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.restaurant', 'restaurant')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.categories', 'category')
      .orderBy('product.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    const totalItems = await this.productRepository.count();
    return getGeneralResponse(items, totalItems);
  }

  findOne(id: string): Promise<Product> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.restaurant', 'restaurant')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.categories', 'category')
      .where('product.id = :id', { id })
      .getOne();
  }

  async findByKey(data: FindByKeyInput): Promise<Product[]> {
    const { field, value } = data;
    return this.productRepository.find({ where: { [field]: value } });
  }

  findByResCatComb(data: FindByResCatCombInput): Promise<Product[]> {
    const { restaurant, category } = data;
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.restaurant', 'restaurant')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.media', 'media')
      .where('restaurant.id = :restaurant', { restaurant })
      .andWhere('categories.id = :category', { category })
      .getMany();
  }

  async create(data: AddProductInput): Promise<Product> {
    const { categories, restaurant, ...info } = data;
    const findedInDataCategories = await this.categoryService.findInData(
      categories,
    );

    const findedRestaurants =
      typeof restaurant === 'string'
        ? await this.restaurantService.findOne(restaurant)
        : restaurant;

    const newProduct = {
      ...info,
      categories: findedInDataCategories,
      restaurant: findedRestaurants,
    };
    categories.forEach(async (category: any) => {
      if (typeof restaurant !== 'string') return false;
      const findedBunch = await this.restaurantCategoryService.findBunch({
        restaurant,
        category,
      });
      if (!findedBunch.length) {
        await this.restaurantCategoryService.createBunch({
          restaurant,
          category,
        });
      }
    });

    const createdProduct = await this.productRepository.save(newProduct);

    return createdProduct;
  }

  async delete(id: string): Promise<boolean> {
    const { affected } = await this.productRepository
      .createQueryBuilder('product')
      .delete()
      .where('id = :id', { id })
      .execute();
    return affected ? true : false;
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const { categories, ...info } = data;

    const findedInDataCategories = await this.categoryService.findInData(
      categories,
    );

    const updatedLocalEntity = await this.productRepository.preload({
      id,
      ...info,
    });
    updatedLocalEntity.categories = findedInDataCategories;

    return await this.productRepository.save(updatedLocalEntity);
  }
}

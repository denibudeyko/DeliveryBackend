import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GraphQLUpload } from 'graphql-upload';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './category/category.module';
import { MediaModule } from './media/media.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

@Module({
  imports: [
    DatabaseModule,
    CategoryModule,
    MediaModule,
    RestaurantModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      resolvers: {
        Upload: GraphQLUpload,
      },
      formatError: (error: GraphQLError) => {
        const graphQLFormattedError: GraphQLFormattedError = {
          message: error.extensions.code || 500,
        };
        return graphQLFormattedError;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

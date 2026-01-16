import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from '../../database/entities/news.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { Like } from '../../database/entities/like.entity';
import { Comment } from '../../database/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  imports: [TypeOrmModule.forFeature([News, Like, Comment])],
  providers: [NewsService],
  controllers: [NewsController],
})
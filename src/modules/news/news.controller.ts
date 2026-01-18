import { Controller, Post, Get, Body, UseGuards, Req, Delete, Param, ParseIntPipe, ForbiddenException, Patch, UsePipes, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsStatusDto } from './dto/news.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/types';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateCommentDto } from './dto/news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(ZodValidationPipe)
  async create(@Body() data: CreateNewsDto, @Req() req: any) {
    return this.newsService.create(data, req.user);
  }
  @Get()
  async getPublicNews(
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
  ) {
    const catId = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.newsService.findAllPublished(catId, search);
  }
  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  async getMyPosts(@Req() req: any) {
    return this.newsService.findByAuthor(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPendingNews(@Req() req: any) {
    if (req.user.role !== UserRole.PROFESSOR && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Acesso restrito a professores');
    }
    return this.newsService.findPending();
  }
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @UsePipes(ZodValidationPipe)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateNewsStatusDto,
    @Req() req: any
  ) {
    if (req.user.role !== UserRole.PROFESSOR && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas professores podem realizar esta operação');
    }
    return this.newsService.updateStatus(id, data.status, req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.newsService.delete(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId') 
  async moderateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any
  ) {
    return this.newsService.moderateComment(commentId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.newsService.toggleLike(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/check-like')
  async checkLike(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return { hasLiked: await this.newsService.hasUserLiked(id, req.user.id) };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  @UsePipes(ZodValidationPipe)
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.newsService.addComment(id, req.user.id, data.texto);
  }

  @Get(':id/comments')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.getComments(id);
  }
}

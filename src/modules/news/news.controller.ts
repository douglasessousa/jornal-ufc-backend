import { Controller, Post, Get, Body, UseGuards, Req, Delete, Param, ParseIntPipe, ForbiddenException, Patch, UsePipes } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsStatusDto } from './dto/news.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/types';
import { ZodValidationPipe } from 'nestjs-zod';

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
  async getPublicNews() {
    return this.newsService.findAllPublished();
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
}
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../database/entities/news.entity';
import { CreateNewsDto } from './dto/news.dto';
import { UserRole, NewsStatus } from '../../common/types';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async create(data: CreateNewsDto, user: { id: number; role: UserRole }) {
    const news = this.newsRepository.create({
      ...data,
      autor_id: user.id,
    });

    if (user.role === UserRole.BOLSISTA) {
      news.status = NewsStatus.PENDENTE_APROVACAO;
    } else {
      news.status = NewsStatus.PUBLICADO;
    }

    return this.newsRepository.save(news);
  }

  async findAllPublished() {
    return this.newsRepository.find({
      where: { status: NewsStatus.PUBLICADO },
      relations: ['autor', 'categoria'],
      order: { data_publicacao: 'DESC' },
    });
  }

  async findById(id: number) {
    const news = await this.newsRepository.findOne({
    where: { id },
    relations: ['autor', 'categoria'],});

    if (!news) {
    throw new NotFoundException('Notícia não encontrada');
    }

    return news;
  }       

  async findByAuthor(authorId: number) {
    return this.newsRepository.find({
      where: { autor_id: authorId },
      relations: ['categoria'],
      order: { data_publicacao: 'DESC' },
    });
  }

  async findPending() {
    return this.newsRepository.find({
      where: { status: NewsStatus.PENDENTE_APROVACAO },
      relations: ['autor', 'categoria'],
      order: { data_publicacao: 'ASC' },
    });
  }

  async updateStatus(id: number, status: NewsStatus, aprovadorId: number) {
    const news = await this.newsRepository.findOne({ where: { id } });

    if (!news) {
      throw new NotFoundException('Notícia não encontrada');
    }

    if (news.status !== NewsStatus.PENDENTE_APROVACAO) {
      throw new BadRequestException('Esta notícia não está aguardando aprovação');
    }

    news.status = status;
    news.aprovador_id = aprovadorId;

    return this.newsRepository.save(news);
  }

  async delete(id: number, userId: number, role: UserRole) {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) throw new NotFoundException('Notícia não encontrada');

    if (news.autor_id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para eliminar esta notícia');
    }

    return this.newsRepository.remove(news);
  }

}
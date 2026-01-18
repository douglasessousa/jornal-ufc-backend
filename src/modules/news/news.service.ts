import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../../database/entities/news.entity';
import { CreateNewsDto } from './dto/news.dto';
import { UserRole, NewsStatus } from '../../common/types';
import { Like } from '../../database/entities/like.entity';
import { Comment } from '../../database/entities/comment.entity';
import { ILike } from 'typeorm';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) { }

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

  async findAllPublished(categoryId?: number, search?: string) {
    const query = this.newsRepository.createQueryBuilder('news')
      .leftJoinAndSelect('news.autor', 'autor')
      .leftJoinAndSelect('news.categoria', 'categoria')
      .where('news.status = :status', { status: NewsStatus.PUBLICADO });

    if (categoryId) {
      query.andWhere('news.categoria_id = :categoryId', { categoryId });
    }

    if (search) {
      query.andWhere(
        '(news.titulo LIKE :search OR news.resumo LIKE :search OR news.conteudo LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return query.orderBy('news.data_publicacao', 'DESC').getMany();
  }

  async findById(id: number) {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['autor', 'categoria'],
    });
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

  async moderateComment(commentId: number, role: UserRole) {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem moderar comentários');
    }

    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    comment.texto = 'Comentário removido por violar as regras do portal.';

    return this.commentRepository.save(comment);
  }


  async toggleLike(newsId: number, userId: number) {
    const news = await this.findById(newsId);

    const existingLike = await this.likeRepository.findOne({
      where: { noticia_id: newsId, usuario_id: userId },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      news.numero_likes--;
    } else {
      const like = this.likeRepository.create({ noticia_id: newsId, usuario_id: userId });
      await this.likeRepository.save(like);
      news.numero_likes++;
    }

    await this.newsRepository.save(news);
    return { liked: !existingLike, numero_likes: news.numero_likes };
  }

  async addComment(newsId: number, userId: number, texto: string) {
    await this.findById(newsId);

    const comment = this.commentRepository.create({
      noticia_id: newsId,
      usuario_id: userId,
      texto,
    });

    return this.commentRepository.save(comment);
  }

  async getComments(newsId: number) {
    return this.commentRepository.find({
      where: { noticia_id: newsId },
      relations: ['usuario'],
      order: { data_criacao: 'DESC' },
    });
  }

  async hasUserLiked(newsId: number, userId: number) {
    const count = await this.likeRepository.count({
      where: { noticia_id: newsId, usuario_id: userId }
    });
    return count > 0;
  }
}

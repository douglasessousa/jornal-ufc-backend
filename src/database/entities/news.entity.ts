import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NewsStatus } from '../../common/types';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  resumo: string;

  @Column({ type: 'text' })
  conteudo: string;

  @Column()
  imagem_url: string;

  @Column({
    type: 'text',
    default: NewsStatus.PENDENTE_APROVACAO,
  })
  status: NewsStatus;

  @Column({ default: 0 })
  numero_likes: number;

  @CreateDateColumn()
  data_publicacao: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'autor_id' })
  autor: User;

  @Column()
  autor_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'aprovador_id' })
  aprovador: User;

  @Column({ nullable: true })
  aprovador_id: number;

  @ManyToOne(() => Category) 
  @JoinColumn({ name: 'categoria_id' })
  categoria: Category;

  @Column()
  categoria_id: number;
}
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';
import { News } from './news.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column()
  usuario_id: number;

  @ManyToOne(() => News)
  @JoinColumn({ name: 'noticia_id' })
  noticia: News;

  @Column()
  noticia_id: number;
}

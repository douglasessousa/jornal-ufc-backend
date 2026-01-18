import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../common/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async onModuleInit() {
    const adminEmail = 'admin@admin.com';

    const adminExists = await this.usersRepository.findOne({
      where: { email: adminEmail }
    });

    if (!adminExists) {
      const hashedSenha = await bcrypt.hash('admin', 10);

      const admin = this.usersRepository.create({
        nome: 'Administrador do Sistema',
        email: adminEmail,
        senha: hashedSenha,
        role: UserRole.ADMIN,
        avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
      });

      await this.usersRepository.save(admin);
      console.log(`[Database] Usuário Administrador criado: ${adminEmail}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'senha', 'nome', 'role', 'avatarUrl'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
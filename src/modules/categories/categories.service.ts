import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    const defaultCategories = [
      'Acadêmico',
      'Eventos',
      'Editais',
      'Pesquisa',
      'Conquistas',
      'Esportes',
      'Cultura',
    ];

    for (const nome of defaultCategories) {
      const exists = await this.categoryRepository.findOne({ where: { nome } });
      
      if (!exists) {
        const category = this.categoryRepository.create({ nome });
        await this.categoryRepository.save(category);
        console.log(`[Database] Categoria criada: ${nome}`);
      }
    }
  }

  async findAll() {
    return this.categoryRepository.find({ order: { nome: 'ASC' } });
  }
}
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { NewsStatus } from '../../../common/types';

export const CreateNewsSchema = z.object({
  titulo: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  resumo: z.string().min(10, 'O resumo deve ter pelo menos 10 caracteres'),
  conteudo: z.string().min(20, 'O conteúdo deve ser mais detalhado'),
  imagem_url: z.string().url('URL da imagem inválida'),
  categoria_id: z.number().positive('Selecione uma categoria válida'),
});

export const UpdateNewsStatusSchema = z.object({
  status: z.enum([NewsStatus.PUBLICADO, NewsStatus.REJEITADO], {
    message: "O status deve ser PUBLICADO ou REJEITADO",
  }),
});

export class UpdateNewsStatusDto extends createZodDto(UpdateNewsStatusSchema) {}
export class CreateNewsDto extends createZodDto(CreateNewsSchema) {}
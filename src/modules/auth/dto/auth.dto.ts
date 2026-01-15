import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserRole } from '../../../common/types';

export const RegisterSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.email('E-mail institucional inválido').refine(
    (email) => email.endsWith('@ufc.br') || email.endsWith('@alu.ufc.br'),
    'Use o e-mail @ufc.br ou @alu.ufc.br'
 ),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum(UserRole).default(UserRole.BOLSISTA),
  avatarUrl: z.url().optional(),
});

export const LoginSchema = z.object({
  email: z.email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}
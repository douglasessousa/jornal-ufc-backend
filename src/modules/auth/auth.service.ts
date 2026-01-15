import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const userExists = await this.usersService.findByEmail(data.email);
    if (userExists) throw new ConflictException('E-mail já cadastrado');

    const hashedSenha = await bcrypt.hash(data.senha, 10);
    
    const user = await this.usersService.create({
      ...data,
      senha: hashedSenha,
    });

    return this.generateToken(user);
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isPasswordValid = await bcrypt.compare(data.senha, user.senha);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas');

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    };
  }
}
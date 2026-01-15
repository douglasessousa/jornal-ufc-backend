export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSOR = 'PROFESSOR',
  SERVIDOR = 'SERVIDOR',
  BOLSISTA = 'BOLSISTA',
}

export enum NewsStatus {
  RASCUNHO = 'RASCUNHO',
  PENDENTE_APROVACAO = 'PENDENTE_APROVACAO',
  PUBLICADO = 'PUBLICADO',
  REJEITADO = 'REJEITADO',
}

export interface User {
  id: number;
  avatarUrl: string;
  nome: string;
  email: string;
  role: UserRole;
  senha?: string;
}

export interface Category {
  id: number;
  nome: string;
}

export interface News {
  id: number;
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem_url: string;
  data_publicacao: Date | string; 
  status: NewsStatus;
  autor_id: number;
  aprovador_id?: number;
  categoria_id: number;
  numero_likes: number;
}

export interface Comment {
  id: number;
  texto: string;
  data_criacao: Date | string;
  usuario_id: number;
  noticia_id: number;
  usuario?: Partial<User>;
}

export interface Like {
  id: number;
  usuario_id: number;
  noticia_id: number;
}


export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
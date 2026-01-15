import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'UFC_SECRET_KEY_2026', 
    });
  }

  async validate(payload: JwtPayload) {
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
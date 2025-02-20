import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // async validate(payload: any) {
  //  // return { user_id: payload.sub, email: payload.email};

  //  const userEmail = payload.email
  //  return this.authService.validateJwtUser(userEmail);
  // }
  async validate(payload: any) {
    const userEmail = payload.email;
    const user = await this.authService.validateJwtUser(userEmail);
    return { user_id: user.user_id, email: user.email, role: user.role }; // Include the role
  }
}

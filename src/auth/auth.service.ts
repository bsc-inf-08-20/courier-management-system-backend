import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswords } from 'src/resources/bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    const isPasswordMatch = comparePasswords(password, user.password);

    if (user && isPasswordMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /*async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    const isPasswordMatch = comparePasswords(password, user.password)

    if (user && isPasswordMatch) {
      
      return this.login(user.email, user.id, user.roles)
    }
    return null;
  }
    */

  async login(user: any) {
    const payload = { email: user.email, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

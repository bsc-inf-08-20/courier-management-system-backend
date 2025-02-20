import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { comparePasswords } from 'src/resources/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from './types/current-user';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Find the user by email
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await comparePasswords(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Exclude the password from the returned user object
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    // Create the JWT payload with user details and roles
    const payload = {
      email: user.email,
      sub: user.user_id,
      role: user.role, // Include roles in the payload
    };

    // Return the access token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateJwtUser(email: string) {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    };

    return currentUser;
  }
}

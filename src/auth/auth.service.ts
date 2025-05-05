import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from 'src/entities/RefreshToken.entity';
import { User } from 'src/entities/User.entity';
import { Role } from '../enum/role.enum';
import { comparePasswords } from 'src/resources/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
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

  async validateJwtUser(email: string): Promise<User> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async validateAdminUser(email: string, password: string): Promise<any> {
    // First validate the user credentials
    const user = await this.validateUser(email, password);
    
    // Check if the user has Admin role
    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }
    
    return user;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      role: user.role, 
      name: user.name, 
      user_id: user.user_id // Add user_id here
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refreshToken = await this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
    };
  }

  async generateRefreshToken(user: User): Promise<RefreshToken> {
    const token = this.jwtService.sign(
      { email: user.email, role: user.role },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        expiresIn: '7d',
      },
    );

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiryDate,
      isRevoked: false,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken },
        relations: ['user'],
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found');
      }
      if (storedToken.isRevoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      if (storedToken.expiryDate < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      const newAccessToken = this.jwtService.sign(
        {
          email: payload.email,
          role: payload.role,
          name: storedToken.user.name,
          user_id: storedToken.user_id, // Add user_id here
        },
        { expiresIn: '30m' },
      );

      await this.refreshTokenRepository.update(storedToken.id, {
        isRevoked: true,
      });
      const newRefreshToken = await this.generateRefreshToken(storedToken.user);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken.token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw specific errors
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }
}

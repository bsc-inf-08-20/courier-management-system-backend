import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enum/role.enum';
import { RolesGuard } from './auth/guards/roles.guard';
import { LoginDto } from './dto/log-in.dto';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('admin/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateAdminUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('auth/refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enum/role.enum';
import { RolesGuard } from './auth/guards/roles.guard';
import { LoginDto } from './dto/log-in.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('Authentication')
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('admin/login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Admin logged in successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async adminLogin(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateAdminUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('agent/login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Agent logged in successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async agentLogin(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateAgentUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('customer/login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Customer logged in successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async userLogin(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateCustomerUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('auth/validate-admin')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiOkResponse({
    description: 'Admin validation successful',
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async validateRole(@Body() credentials: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      role: user.role,
      message:
        user.role === 'ADMIN'
          ? 'Valid administrator account'
          : 'Invalid role for admin portal',
    };
  }

  @Post('auth/refresh')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string' },
      },
      required: ['refresh_token'],
    },
  })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
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
  @ApiOkResponse({ description: 'User profile retrieved successfully' })
  getProfile(@Request() req) {
    return req.user;
  }
}

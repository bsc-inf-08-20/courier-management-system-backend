import { Controller, Get, UseGuards, Request} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
    return req.user; // Assuming JwtAuthGuard populates req.user
}
}

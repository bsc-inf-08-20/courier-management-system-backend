import { Controller, Get, Param, Delete, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/User.entity';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users') // Base route: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createCustomerDto: CreateUserDto) {
    return this.usersService.createUser(createCustomerDto);
  }

  // Get all users
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Get a single user by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findUserById(id);
  }

  // Delete a user by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // ✅ Protect endpoint
  @Roles(Role.ADMIN) // ✅ Only admins can access
  @Delete()
  async deleteAllUsers() {
    await this.usersService.deleteAllUsers();
    return { message: 'All users deleted successfully' };
  }
}

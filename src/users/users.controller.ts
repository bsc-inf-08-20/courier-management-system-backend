import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/User.entity';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserDto } from 'src/dto/update-user.dto';

@Controller('users') // Base route: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createCustomerDto: CreateUserDto) {
    return this.usersService.createUser(createCustomerDto);
  }

  // get the city of the admin
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getAdminCity(@Request() req) {
    return this.usersService.getAdminCity(req.user.user_id);
  }

  // get all your details
  @UseGuards(JwtAuthGuard)
  @Get('me-data')
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.user_id);
  }


  // Get all users
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // get agents by admin's city
  @Get('agents')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  async getAgentsByCity(@Query('city') city: string) {
    return this.usersService.getAgentsByCity(city);
  }

  // Get a single user by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findUserById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateDto);
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

  // get USER(s)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Only admins can access these routes
  @Get('role/user')
  async getUsersWithUserRole(): Promise<User[]> {
    return this.usersService.getUsersByRole(Role.USER);
  }

  // get ADMIN(s)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('role/admin')
  async getUsersWithAdminRole(): Promise<User[]> {
    return this.usersService.getUsersByRole(Role.ADMIN);
  }

  // get Agent(s)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @Get('role/agent')
  async getUsersWithAgentRole(): Promise<User[]> {
    return this.usersService.getUsersByRole(Role.AGENT);
  }
}

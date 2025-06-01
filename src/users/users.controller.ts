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
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/User.entity';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('users') // Base route: /users
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  @ApiBody({ type: CreateUserDto })
  createUser(@Body() createCustomerDto: CreateUserDto) {
    return this.usersService.createUser(createCustomerDto);
  }

  // get the city of the admin
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({
    description: 'Admin city retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAdminCity(@Request() req) {
    return this.usersService.getAdminCity(req.user.user_id);
  }

  // get all your details
  @UseGuards(JwtAuthGuard)
  @Get('me-data')
  @ApiOkResponse({
    description: 'User details retrieved successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.user_id);
  }

  // Get all users
  @Get()
  @ApiOkResponse({
    description: 'All users retrieved successfully',
    type: [User],
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // get agents by admin's city
  @Get('agents')
  @ApiQuery({ name: 'city', type: 'string', description: 'City' })
  @ApiOkResponse({
    description: 'Agents retrieved successfully by city',
    type: [User],
  })
  async getAgentsByCity(@Query('city') city: string) {
    return this.usersService.getAgentsByCity(city);
  }

  // Get a single user by ID
  @Get(':id')
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiOkResponse({
    description: 'User retrieved successfully by ID',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findUserById(id);
  }

  // get driver by driver by admin's city
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('city/drivers')
  @ApiQuery({ name: 'city', type: 'string', description: 'City' })
  @ApiOkResponse({
    description: 'Drivers retrieved successfully by city',
    type: [User],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'No drivers found in this city' })
  async getDriversByCity(@Query('city') city: string) {
    if (!city) {
      throw new NotFoundException('City is required');
    }

    const drivers = await this.usersService.getDriversByCity(city);

    if (!drivers || drivers.length === 0) {
      throw new NotFoundException('No drivers found in this city');
    }

    return drivers;
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateUser(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateDto);
  }

  // Delete a user by ID
  @Delete(':id')
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // ✅ Protect endpoint
  @Roles(Role.ADMIN) // ✅ Only admins can access
  @Delete()
  @ApiOkResponse({ description: 'All users deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async deleteAllUsers() {
    await this.usersService.deleteAllUsers();
    return { message: 'All users deleted successfully' };
  }

  // get USER(s)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Only admins can access these routes
  @Get('role/user')
  @ApiOkResponse({
    description: 'Users with USER role retrieved successfully',
    type: [User],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getUsersWithUserRole(): Promise<User[]> {
    return this.usersService.getUsersByRole(Role.USER);
  }

  // get ADMIN(s)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('role/admin')
  @ApiOkResponse({
    description: 'Users with ADMIN role retrieved successfully',
    type: [User],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getUsersWithAdminRole(): Promise<User[]> {
    return this.usersService.getUsersByRole(Role.ADMIN);
  }

  // get Agent(s)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @Get('role/agent')
  @ApiOkResponse({
    description: 'Users with AGENT role retrieved successfully',
    type: [User],
  })
  async getUsersWithAgentRole(): Promise<User[]> {
    return this.usersService.getUsersByRole(Role.AGENT);
  }
}

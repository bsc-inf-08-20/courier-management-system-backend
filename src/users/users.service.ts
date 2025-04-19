import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/CreateUser.dto';
import { encodePassword } from 'src/resources/bcrypt';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // create a user
  createUser = async (userContent: CreateUserDto) => {
    // Check if user already exists
    const existingUser = await this.userRepository.findOneBy({
      email: userContent.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists'); // HTTP 409 Conflict
    }

    const password = encodePassword(userContent.password);
    const newUser = this.userRepository.create({
      ...userContent,
      password,
    });

    return this.userRepository.save(newUser);
  };

  async getAdminCity(userId: number) {
    const admin = await this.userRepository.findOne({
      where: { user_id: userId },
      select: ['city'],
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return { city: admin.city };
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findUserById = async (id: number): Promise<User> => {
    const User = await this.userRepository.findOneBy({
      user_id: id,
    });

    if (!User) {
      throw new NotFoundException('User not found'); // HTTP 404 Not Found
    }

    return User;
  };

  async findOne(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


  async findUserByEmail(email: string): Promise<User | null> {
    const User = await this.userRepository.findOneBy({
      email: email,
    });

    if (!User) {
      throw new NotFoundException('User not found'); // HTTP 404 Not Found
    }

    return User;
  }

  //update a user
  async updateUser(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateDto); // ✅ Merge updates
    return this.userRepository.save(user); // ✅ Save changes
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // delete all users
  async deleteAllUsers(): Promise<void> {
    await this.userRepository.delete({});
  }

  // get by user by role
  async getUsersByRole(role: Role): Promise<User[]> {
    return this.userRepository.find({ where: { role } });
  }

  //get agent by admin's city
  async getAgentsByCity(city: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        role: Role.AGENT,
        city: Like(`%${city}%`),
      },
      select: ['user_id', 'name', 'email', 'phone_number', 'city'],
    });
  }

  // get driver by admin's city
  async getDriversByCity(city: string): Promise<User[]> {
    const drivers = await this.userRepository.find({
      where: {
        current_city: city,
        role: Role.DRIVER,
        is_active: true, // Only return active drivers
      },
      select: [
        'user_id',
        'name',
        'email',
        'phone_number',
        'current_city',
        'is_active',
      ],
    });

    return drivers;
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/CreateUser.dto';
import { encodePassword } from 'src/resources/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne = async (id: number): Promise<User> => {
    const User = await this.userRepository.findOneBy({
      user_id: id,
    });

    if (!User) {
      throw new NotFoundException('User not found'); // HTTP 404 Not Found
    }

    return User;
  };

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
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

  findUserById = async (id: number): Promise<User> => {
    const User = await this.userRepository.findOneBy({
      user_id: id,
    });

    if (!User) {
      throw new NotFoundException('User not found'); // HTTP 404 Not Found
    }

    return User;
  };

  findUserByEmail = async (email: string): Promise<User> => {
    const User = await this.userRepository.findOneBy({
      email: email,
    });

    if (!User) {
      throw new NotFoundException('User not found'); // HTTP 404 Not Found
    }

    return User;
  };

  //update a user
  async updateUser(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      throw new NotFoundException("User not found");
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
}

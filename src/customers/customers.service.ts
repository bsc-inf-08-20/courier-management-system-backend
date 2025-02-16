import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/Customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/CreateCustomer.dto';
import { encodePassword } from 'src/resources/bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  createCustomer = async (customerContent: CreateCustomerDto) => {
    // Check if user already exists
    const existingCustomer = await this.customerRepository.findOneBy({
      email: customerContent.email,
    });

    if (existingCustomer) {
      throw new ConflictException('User with this email already exists'); // HTTP 409 Conflict
    }

    const password = encodePassword(customerContent.password);
    const newCustomer = this.customerRepository.create({
      ...customerContent,
      password,
    });

    return this.customerRepository.save(newCustomer);
  };

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  findOne = async (id: number): Promise<Customer> => {
    const customer = await this.customerRepository.findOneBy({
      customer_id: id,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found'); // HTTP 404 Not Found
    }

    return customer;
  };

  async remove(id: number): Promise<void> {
    await this.customerRepository.delete(id);
  }
}

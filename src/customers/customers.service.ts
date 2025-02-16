import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/Customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/CreateCustomer.dto';

@Injectable()
export class CustomersService { 
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  createCustomer(customerContent: CreateCustomerDto) {
    //const password = encodePassword(userContent.password)
    const newCustomer = this.customerRepository.create({
      ...customerContent,
      //password
    });
    return this.customerRepository.save(newCustomer);
  }

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  findOne(id: number): Promise<Customer | null> {
    return this.customerRepository.findOneBy({ customer_id: id });
  }

  async remove(id: number): Promise<void> {
    await this.customerRepository.delete(id);
  }
}

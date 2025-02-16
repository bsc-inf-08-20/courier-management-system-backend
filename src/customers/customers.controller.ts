import { Controller, Get, Param, Delete, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from 'src/entities/Customer.entity';
import { CreateCustomerDto } from './dto/CreateCustomer.dto';

@Controller('customers') // Base route: /customers
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post() 
  createUser(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.createCustomer(createCustomerDto);
  }

  // Get all customers
  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  // Get a single customer by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Customer | null> {
    return this.customersService.findOne(id);
  }

  // Delete a customer by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.customersService.remove(id);
  }
}

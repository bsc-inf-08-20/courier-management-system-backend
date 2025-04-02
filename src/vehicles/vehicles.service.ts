import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from 'src/entities/Vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}


  //create vehicle instance
  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(data);
    return this.vehicleRepository.save(vehicle);
  }

  //get all vehicle
  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehicleRepository.find();
  }

  // get vehicle by lincensePlate
  async getVehicleByLicensePlate(license_plate: string): Promise<Vehicle | null> {
    return this.vehicleRepository.findOne({ where: { license_plate } });
  }

  // get vehicle by city
  async getVehiclesByCity(current_city: string): Promise<Vehicle[]> {
    // console.log('Service received city:', current_city);
    return await this.vehicleRepository.find({ where: { current_city } });
  }
}


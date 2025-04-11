import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from 'src/entities/Vehicle.entity';
import { User } from 'src/entities/User.entity';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
  async getVehicleByLicensePlate(
    license_plate: string,
  ): Promise<Vehicle | null> {
    return this.vehicleRepository.findOne({ where: { license_plate } });
  }

  // get vehicle by city
  // async getVehiclesByCity(city: string) {
  //   const vehicles = await this.vehicleRepository.find({
  //     where: { current_city: city },
  //     relations: ['assigned_driver'],
  //   });
  //   console.log(vehicles);
  // }

  async getVehiclesByCity(city: string): Promise<Vehicle[]> {
    const vehicles = await this.vehicleRepository.find({
        where: { 
            current_city: city,
            is_active: true,        // Only active vehicles
            is_in_maintenance: false // Not in maintenance
        },
        relations: ['assigned_driver'] // Include driver and their profile
    });

    if (!vehicles || vehicles.length === 0) {
        throw new NotFoundException(`No available vehicles found in ${city}`);
    }

    return vehicles;
}

  // async assignVehicleToDriver(
  //   vehicleId: number,
  //   driverId: number,
  //   requestingUser: User,
  // ): Promise<Vehicle> {
  //   // Check if requesting user is admin
  //   if (requestingUser.role !== Role.ADMIN) {
  //     throw new ForbiddenException('Only admins can assign vehicles');
  //   }

  //   // Find vehicle
  //   const vehicle = await this.vehicleRepository.findOne({
  //     where: { id: vehicleId },
  //     relations: ['assigned_driver'],
  //   });
  //   if (!vehicle) {
  //     throw new NotFoundException('Vehicle not found');
  //   }

  //   // Find driver
  //   const driver = await this.userRepository.findOne({
  //     where: { user_id: driverId, role: Role.DRIVER },
  //     relations: ['assignedVehicle'],
  //   });
  //   if (!driver) {
  //     throw new NotFoundException('Driver not found');
  //   }

  //   // If vehicle is already assigned to another driver, remove that assignment
  //   if (
  //     vehicle.assigned_driver &&
  //     vehicle.assigned_driver.user_id !== driverId
  //   ) {
  //     const previousDriver = await this.userRepository.findOne({
  //       where: { user_id: vehicle.assigned_driver.user_id },
  //     });
  //     if (previousDriver) {
  //       previousDriver.assignedVehicle = null;
  //       await this.userRepository.save(previousDriver);
  //     }
  //   }

  //   // If driver already has a vehicle, remove that assignment
  //   if (driver.assignedVehicle && driver.assignedVehicle.id !== vehicleId) {
  //     const previousVehicle = await this.vehicleRepository.findOne({
  //       where: { id: driver.assignedVehicle.id },
  //     });
  //     if (previousVehicle) {
  //       previousVehicle.assigned_driver = null;
  //       await this.vehicleRepository.save(previousVehicle);
  //     }
  //   }

  //   // Assign vehicle to driver
  //   vehicle.assigned_driver = driver;
  //   driver.assignedVehicle = vehicle;

  //   await this.vehicleRepository.save(vehicle);
  //   await this.userRepository.save(driver);

  //   return vehicle;
  // }

  async assignVehicleToDriver(
    vehicleId: number,
    driverId: number,
    requestingUser: User,
  ): Promise<Vehicle> {
    // Check if requesting user is admin
    if (requestingUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can assign vehicles');
    }
  
    // Find vehicle
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: ['assigned_driver'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
  
    // Find driver
    const driver = await this.userRepository.findOne({
      where: { user_id: driverId, role: Role.DRIVER },
      relations: ['assignedVehicle'],
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
  
    // Clear previous assignments
    if (vehicle.assigned_driver && vehicle.assigned_driver.user_id !== driverId) {
      const previousDriver = await this.userRepository.findOne({
        where: { user_id: vehicle.assigned_driver.user_id },
      });
      if (previousDriver) {
        previousDriver.assignedVehicle = null;
        await this.userRepository.save(previousDriver);
      }
    }
  
    if (driver.assignedVehicle && driver.assignedVehicle.id !== vehicleId) {
      const previousVehicle = await this.vehicleRepository.findOne({
        where: { id: driver.assignedVehicle.id },
      });
      if (previousVehicle) {
        previousVehicle.assigned_driver = null;
        await this.vehicleRepository.save(previousVehicle);
      }
    }
  
    // Assign vehicle to driver
    vehicle.assigned_driver = driver;
    driver.assignedVehicle = vehicle;
  
    await this.vehicleRepository.save(vehicle);
    await this.userRepository.save(driver);
  
    // Get updated vehicle with relations
    const updatedVehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: ['assigned_driver'],
    });
  
    if (!updatedVehicle) {
      throw new NotFoundException('Vehicle not found after assignment');
    }
  
    return updatedVehicle;
  }
}

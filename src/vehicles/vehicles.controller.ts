import { Controller, Post, Get, Body, Param, UseGuards, Query, NotFoundException,Request, Put } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from 'src/entities/Vehicle.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}


  // only the admin can create a vehicle
  @Post()
  async createVehicle(@Body() data: Partial<Vehicle>): Promise<Vehicle> {
    return this.vehiclesService.createVehicle(data);
  }

  @Get()
  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehiclesService.getAllVehicles();
  }

  @Get(':license_plate')
  async getVehicleByLicensePlate(@Param('license_plate') license_plate: string): Promise<Vehicle | null> {
    return this.vehiclesService.getVehicleByLicensePlate(license_plate);
  }

  @UseGuards(JwtAuthGuard) // Protect the endpoint
  @Get()
  async getVehiclesByCity(@Query('city') city: string, @Request() req) {
    console.log('Fetching vehicles in city:', city);

    if (!city) {
      throw new NotFoundException('City is required');
    }

    const vehicles = await this.vehiclesService.getVehiclesByCity(city);
    
    if (!vehicles || vehicles.length === 0) {
      throw new NotFoundException(`No vehicles found in ${city}`);
    }

    return vehicles;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':vehicleId/assign-driver')
  async assignDriver(
    @Param('vehicleId') vehicleId: number,
    @Body('driverId') driverId: number,
    @Request() req,
  ): Promise<Vehicle> {
    return this.vehiclesService.assignVehicleToDriver(vehicleId, driverId, req.user);
  }
}


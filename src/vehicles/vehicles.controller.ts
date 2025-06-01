import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  NotFoundException,
  Request,
  Put,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from 'src/entities/Vehicle.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { VehicleResponseDto } from 'src/dto/vehicle-response.dto';
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

@Controller('vehicles')
@ApiTags('Vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // only the admin can create a vehicle
  @Post()
  @ApiCreatedResponse({
    description: 'Vehicle created successfully',
    type: Vehicle,
  })
  @ApiBody({ type: Vehicle })
  async createVehicle(@Body() data: Partial<Vehicle>): Promise<Vehicle> {
    return this.vehiclesService.createVehicle(data);
  }

  @Get()
  @ApiOkResponse({
    description: 'All vehicles retrieved successfully',
    type: [Vehicle],
  })
  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehiclesService.getAllVehicles();
  }

  @Get(':license_plate')
  @ApiParam({
    name: 'license_plate',
    type: 'string',
    description: 'Vehicle License Plate',
  })
  @ApiOkResponse({
    description: 'Vehicle retrieved successfully by license plate',
    type: Vehicle,
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async getVehicleByLicensePlate(
    @Param('license_plate') license_plate: string,
  ): Promise<Vehicle | null> {
    return this.vehiclesService.getVehicleByLicensePlate(license_plate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-city') // Changed to a distinct path to avoid conflict
  @ApiQuery({ name: 'city', type: 'string', description: 'City' })
  @ApiOkResponse({
    description: 'Vehicles retrieved successfully by city',
    type: [Vehicle],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'No vehicles found in this city' })
  async getVehiclesByCity(@Query('city') city: string): Promise<Vehicle[]> {
    console.log('Fetching vehicles in city:', city);

    if (!city) {
      throw new NotFoundException('City is required');
    }

    return this.vehiclesService.getVehiclesByCity(city);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':vehicleId/assign-driver')
  @ApiParam({ name: 'vehicleId', type: 'number', description: 'Vehicle ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        driverId: { type: 'number' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Driver assigned to vehicle successfully',
    type: VehicleResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Vehicle or Driver not found' })
  async assignDriver(
    @Param('vehicleId') vehicleId: number,
    @Body('driverId') driverId: number,
    @Request() req,
  ): Promise<VehicleResponseDto> {
    const updatedVehicle = await this.vehiclesService.assignVehicleToDriver(
      vehicleId,
      driverId,
      req.user,
    );

    return plainToInstance(VehicleResponseDto, updatedVehicle);
  }
}

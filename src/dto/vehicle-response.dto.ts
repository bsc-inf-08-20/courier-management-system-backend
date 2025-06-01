// vehicle-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleDriverDto {
  @ApiProperty({ description: 'Driver ID' })
  @Expose()
  user_id: number;

  @ApiProperty({ description: 'Driver Name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Driver Email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Driver Phone Number' })
  @Expose()
  phone_number: string;
}

export class VehicleResponseDto {
  @ApiProperty({ description: 'Vehicle ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Vehicle Make' })
  @Expose()
  make: string;

  @ApiProperty({ description: 'Vehicle Model' })
  @Expose()
  model: string;

  @ApiProperty({ description: 'Vehicle License Plate' })
  @Expose()
  license_plate: string;

  @ApiProperty({ description: 'Vehicle Status' })
  @Expose()
  status: string;

  @ApiProperty({ description: 'Assigned Driver', type: SimpleDriverDto })
  @Expose()
  @Type(() => SimpleDriverDto)
  assigned_driver?: SimpleDriverDto;
}
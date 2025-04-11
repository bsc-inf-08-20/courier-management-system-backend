// vehicle-response.dto.ts
import { Expose, Type } from 'class-transformer';

export class SimpleDriverDto {
  @Expose()
  user_id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone_number: string;
}

export class VehicleResponseDto {
  @Expose()
  id: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Expose()
  license_plate: string;

  @Expose()
  status: string;

  @Expose()
  @Type(() => SimpleDriverDto)
  assigned_driver?: SimpleDriverDto;
}
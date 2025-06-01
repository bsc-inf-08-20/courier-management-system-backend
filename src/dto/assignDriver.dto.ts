// assign-driver.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AssignDriverDto {
  @ApiProperty({ description: 'Driver ID' })
  driverId: number;
}
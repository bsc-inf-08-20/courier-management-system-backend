import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({ description: 'Latitude' })
  lat: number;

  @ApiProperty({ description: 'Longitude' })
  lng: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackingEventDto {
  @ApiProperty({ description: 'Agent ID' })
  agentId: number;

  @ApiProperty({ description: 'Packet ID' })
  packetId: number;

  @ApiPropertyOptional({ description: 'Location (latitude and longitude)' })
  location?: { lat: number; lng: number };

  @ApiPropertyOptional({
    description: 'Event Type',
    enum: ['location_update', 'reached_origin', 'reached_destination'],
  })
  eventType?: 'location_update' | 'reached_origin' | 'reached_destination';
}

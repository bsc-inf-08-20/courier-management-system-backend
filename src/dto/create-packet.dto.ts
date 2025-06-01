// create-packet.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreatePacketDto {
  @ApiProperty({ description: 'Packet Description' })
  description: string;

  @ApiProperty({ description: 'Packet Weight' })
  weight: string; // Frontend sends string

  @ApiProperty({ description: 'Packet Category' })
  category: string;

  @ApiProperty({ description: 'Instructions' })
  instructions?: string;

  @ApiProperty({ enum: ['pickup', 'delivery'], description: 'Delivery Type' })
  delivery_type: 'pickup' | 'delivery';

  @ApiProperty({ description: 'Origin City' })
  origin_city: string;

  @ApiProperty({ description: 'Origin Address' })
  origin_address: string;

  @ApiProperty({ description: 'Origin Coordinates' })
  origin_coordinates: { lat: number; lng: number };

  @ApiProperty({ description: 'Destination Address' })
  destination_address: string;

  @ApiProperty({ description: 'Destination Coordinates' })
  destination_coordinates: { lat: number; lng: number };

  @ApiProperty({ description: 'Destination Hub (Optional)' })
  destination_hub?: string;

  @ApiProperty({ description: 'Sender Information' })
  sender: {
    name: string;
    email: string;
    phone_number: string;
  };

  @ApiProperty({ description: 'Receiver Information' })
  receiver: {
    name: string;
    email: string;
    phone_number: string;
  };
}

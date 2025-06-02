import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PickupWindowDto } from './window.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNumber()
  lng: number;
}

export class ContactInfoDto {
  @ApiProperty({ description: 'Contact Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Contact Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact Phone Number' })
  @IsString()
  phone_number: string;
}

export class CreatePacketPickupDto {
  // Packet information
  @ApiProperty({ description: 'Packet Description' })
  @IsString()
  @IsNotEmpty()
  packet_description: string;

  @ApiProperty({ description: 'Packet Weight' })
  @IsNumber()
  @IsNotEmpty()
  packet_weight: number;

  @ApiProperty({ description: 'Packet Category' })
  @IsString()
  @IsNotEmpty()
  packet_category: string;

  @ApiProperty({ description: 'Instructions' })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({ enum: ['pickup', 'delivery'], description: 'Delivery Type' })
  @IsEnum(['pickup', 'delivery'])
  @IsNotEmpty()
  delivery_type: 'pickup' | 'delivery';

  // Origin information
  @ApiProperty({ description: 'Pickup Address' })
  @IsString()
  @IsNotEmpty()
  pickup_address: string;

  @ApiProperty({ description: 'Pickup City' })
  @IsString()
  @IsNotEmpty()
  pickup_city: string; // City where the pickup is requested

  // Optional fields
  @ApiPropertyOptional({ description: 'Destination Hub (Optional)' })
  @IsString()
  @IsOptional()
  destination_hub?: string;

  @ApiProperty({ type: CoordinatesDto, description: 'Origin Coordinates' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  origin_coordinates: CoordinatesDto;

  @ApiProperty({
    type: CoordinatesDto,
    description: 'Destination Coordinates',
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  destination_coordinates: CoordinatesDto;

  @ApiProperty({ description: 'Destination Address' })
  destination_address: string;

  @ApiProperty({ type: ContactInfoDto, description: 'Sender Information' })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  sender: ContactInfoDto;

  @ApiProperty({ type: ContactInfoDto, description: 'Receiver Information' })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  receiver: ContactInfoDto;

  @ApiProperty({ type: PickupWindowDto, description: 'Pickup Window' })
  @ValidateNested()
  @Type(() => PickupWindowDto)
  pickup_window: PickupWindowDto;
}

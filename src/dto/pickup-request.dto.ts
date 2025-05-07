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

export class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class ContactInfoDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone_number: string;
}

export class CreatePacketDto {
  // Packet information
  @IsString()
  @IsNotEmpty()
  packet_description: string;

  @IsNumber()
  @IsNotEmpty()
  packet_weight: number;

  @IsString()
  @IsNotEmpty()
  packet_category: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  // Delivery type
  @IsEnum(['pickup', 'delivery'])
  @IsNotEmpty()
  delivery_type: 'pickup' | 'delivery';

  // Origin information
  @IsString()
  @IsNotEmpty()
  pickup_address: string;

  // Optional fields
  @IsString()
  @IsOptional()
  destination_hub?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  origin_coordinates: CoordinatesDto;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  destination_coordinates: CoordinatesDto;

  destination_address: string;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  sender: ContactInfoDto;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  receiver: ContactInfoDto;

  @ValidateNested()
  @Type(() => PickupWindowDto)
  pickup_window: PickupWindowDto;
}

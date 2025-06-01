import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'User Phone Number' })
  @IsOptional()
  @IsPhoneNumber('MW') // Assuming Malawian phone numbers
  phone_number?: string;

  @ApiPropertyOptional({ description: 'User Address' })
  @IsOptional()
  @IsString()
  address?: string;
}

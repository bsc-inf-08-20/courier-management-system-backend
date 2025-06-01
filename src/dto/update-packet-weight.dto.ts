// update-packet-weight.dto.ts
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePacketWeightDto {
  @ApiPropertyOptional({
    description: 'Packet Weight',
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  weight: number;
}
// update-packet-weight.dto.ts
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePacketWeightDto {
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  weight: number;
}
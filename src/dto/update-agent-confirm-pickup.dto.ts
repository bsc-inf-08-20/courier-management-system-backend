import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAgentConfirmPickupDto {
  @IsNotEmpty()
  @IsString()
  goodsId: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsNumber()
  weight: number;
}

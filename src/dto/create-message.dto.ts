import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  @IsNotEmpty()
  adminId: number;

  @IsNumber()
  @IsNotEmpty()
  agentId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

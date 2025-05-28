import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(['sent', 'read'])
  status?: 'sent' | 'read';
}

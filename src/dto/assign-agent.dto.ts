import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAgentDto {
  @ApiProperty({ description: 'Agent ID' })
  @IsNumber()
  agentId: number;
}

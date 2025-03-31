import { IsNumber } from "class-validator";

export class AssignAgentDto {
  @IsNumber()
  agentId: number;
}

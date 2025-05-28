import { IsOptional, IsString, IsPhoneNumber } from "class-validator";

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber("MW") // Malawian phone numbers
  phone_number?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

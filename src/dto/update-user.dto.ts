import { IsOptional, IsString, IsPhoneNumber } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber("MW") // Assuming Malawian phone numbers
  phone_number?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

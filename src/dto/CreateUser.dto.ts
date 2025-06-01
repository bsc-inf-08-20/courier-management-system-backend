import { Role } from 'src/enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User Name' })
  name: string;

  @ApiProperty({ description: 'User Email' })
  email: string;

  @ApiProperty({ description: 'User Password' })
  password: string;

  @ApiProperty({ description: 'User Phone Number' })
  phone_number: string;

  @ApiProperty({ description: 'User City' })
  city: string;

  @ApiProperty({ description: 'User Area' })
  area: string;

  @ApiProperty({ enum: Role, description: 'User Role' })
  role: Role;
}

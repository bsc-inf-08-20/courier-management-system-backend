import { Role } from 'src/enum/role.enum';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  // address: string;
  city: string;
  area: string
  role: Role;
}

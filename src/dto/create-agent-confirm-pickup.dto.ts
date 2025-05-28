import { Role } from 'src/enum/role.enum';

export class CreateAgentConfirmPickupDto {
  goodsId: string;
  customerName: string;
  weight: number;
  role: Role;
}
import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { PacketsService } from './packets.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('packets')
export class PacketsController {
  constructor(private readonly packetsService: PacketsService) {}

  // GET /packets
  @Get()
  async getAllPackets() {
    return this.packetsService.getAllPackets();
  }


  //get admins packet
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminPackets(@Request() req) {
    return this.packetsService.getPacketsForAdmin(req.user.user_id);
  }

  // Admins in Lilongwe, Blantyre, or Zomba confirm dispatch:
  @Patch(':id/confirm-dispatch')
  async confirmDispatch(@Param('id') id: number) {
    return this.packetsService.confirmPacketDispatch(id);
  }

  @Patch(':id/agent-confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async agentConfirmCollection(
    @Param('id') id: string, @Request() req,
  ) {
    return this.packetsService.agentConfirmCollection(parseInt(id), req.user.user_id);
  }

  @Patch(':id/hub-confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminConfirmAtHub(@Param('id') id: string) {
    return this.packetsService.adminConfirmAtHub(parseInt(id));
  }

  @Patch(':id/dispatch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminDispatchForTransport(@Param('id') id: string) {
    return this.packetsService.adminDispatchForTransport(parseInt(id));
  }

  @Patch(':id/destination-hub-confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async confirmAtDestinationHub(@Param('id') id: string) {
    return this.packetsService.confirmAtDestinationHub(parseInt(id));
  }

  @Patch(':id/out-for-delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async markOutForDelivery(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.packetsService.markOutForDelivery(parseInt(id));
  }

  @Patch(':id/delivered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async markAsDelivered(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.packetsService.markAsDelivered(parseInt(id));
  }

  @Patch(':id/received')
  @UseGuards(JwtAuthGuard)
  async confirmReceiverReceived(@Param('id') id: string) {
    return this.packetsService.confirmReceiverReceived(parseInt(id));
  }

  

}

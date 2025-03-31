import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PacketsService } from './packets.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdatePacketWeightDto } from 'src/dto/update-packet-weight.dto';

@Controller('packets')
export class PacketsController {
  constructor(private readonly packetsService: PacketsService) {}

  // GET all packets
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

  
  @Patch(':id/weight')
  async updateWeight(
    @Param('id') id: string,
    @Body() updatePacketWeightDto: UpdatePacketWeightDto,
  ) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Invalid packet ID');
    }
    if (updatePacketWeightDto.weight <= 0) {
      throw new BadRequestException('Weight must be greater than 0');
    }

    return this.packetsService.updateWeight(+id, updatePacketWeightDto.weight);
  }


  @Patch(':id/agent-confirm')
  async agentConfirmCollection(
    @Param('id') id: string,
    @Body() updatePacketDto: UpdatePacketWeightDto,
  ) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Invalid packet ID');
    }

    return this.packetsService.agentConfirmCollection(+id, updatePacketDto.weight);
  }

  // @Patch(':id/agent-confirm')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.AGENT)
  // async agentConfirmCollection(
  //   @Param('id') id: string,
  //   @Request() req,
  //   @Body('weight') weight?: number,
  // ) {
  //   if (!req.user || !req.user.user_id) {
  //     throw new HttpException(
  //       'Unauthorized: User not authenticated',
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  //   return this.packetsService.agentConfirmCollection(
  //     parseInt(id),
  //     req.user.user_id,
  //     weight,
  //   );
  // }

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
  async markOutForDelivery(@Param('id') id: string, @Request() req) {
    return this.packetsService.markOutForDelivery(parseInt(id));
  }

  @Patch(':id/delivered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async markAsDelivered(@Param('id') id: string, @Request() req) {
    return this.packetsService.markAsDelivered(parseInt(id));
  }

  @Patch(':id/received')
  @UseGuards(JwtAuthGuard)
  async confirmReceiverReceived(@Param('id') id: string) {
    return this.packetsService.confirmReceiverReceived(parseInt(id));
  }

  @Post('dispatch-batch')
  @Roles(Role.ADMIN)
  async dispatchBatch(
    @Body() body: { packetIds: number[]; driverId: number; vehicleId: number },
  ) {
    return this.packetsService.dispatchBatch(
      body.packetIds,
      body.driverId,
      body.vehicleId,
    );
  }
}

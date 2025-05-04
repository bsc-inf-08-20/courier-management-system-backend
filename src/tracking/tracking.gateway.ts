import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  import { PacketsService } from 'src/packets/packets.service';
  import { UsersService } from 'src/users/users.service';
  import { Role } from 'src/enum/role.enum';
  
  @WebSocketGateway({
    namespace: '/tracking',
    cors: {
      origin: '*', // Restrict this in production!
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })
  export class TrackingGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('TrackingGateway');
  
    // Store connected agents and their sockets
    private agentConnections: Map<number, Socket> = new Map();
    // Store latest agent locations
    private agentLocations: Map<number, { lat: number; lng: number }> = new Map();
  
    constructor(
      private readonly packetService: PacketsService,
      private readonly userService: UsersService,
    ) {}
  
    afterInit(server: Server) {
      this.logger.log('Tracking WebSocket Gateway initialized');
      // Cleanup old locations every hour
      setInterval(() => this.cleanupOldLocations(), 3600000);
    }
  
    async handleConnection(client: Socket) {
      try {
        const userId = parseInt(client.handshake.query.userId as string);
        const user = await this.userService.findOne(userId);
  
        if (!user || user.role !== Role.AGENT) {
          this.logger.warn(`Unauthorized connection attempt from user ${userId}`);
          client.disconnect(true);
          return;
        }
  
        this.logger.log(`Agent ${userId} connected`);
        this.agentConnections.set(userId, client);
  
        // Notify the agent about their assigned packets
        const assignedPackets = await this.packetService.findByAgent(userId);
        client.emit('assigned_packets', assignedPackets);
  
      } catch (error) {
        this.logger.error('Connection error:', error.message);
        client.disconnect(true);
      }
    }
  
    handleDisconnect(client: Socket) {
      for (const [userId, socket] of this.agentConnections.entries()) {
        if (socket.id === client.id) {
          this.logger.log(`Agent ${userId} disconnected`);
          this.agentConnections.delete(userId);
          this.agentLocations.delete(userId);
          break;
        }
      }
    }
  
    @SubscribeMessage('update_location')
    async handleLocationUpdate(
      @MessageBody() data: { lat: number; lng: number },
      @ConnectedSocket() client: Socket,
    ) {
      try {
        const userId = parseInt(client.handshake.query.userId as string);
        
        if (!this.agentConnections.has(userId)) {
          throw new Error('Unauthorized location update');
        }
  
        this.agentLocations.set(userId, { lat: data.lat, lng: data.lng });
        this.logger.debug(`Agent ${userId} location updated`);
  
        // Broadcast to admin dashboards
        this.server.emit('agent_location_updated', {
          agentId: userId,
          location: data,
        });
  
        // Check if agent reached any packet locations
        await this.checkProximityToPackets(userId, data);
      } catch (error) {
        this.logger.error('Location update error:', error.message);
      }
    }
  
    @SubscribeMessage('packet_status_update')
    async handlePacketStatusUpdate(
      @MessageBody() data: { packetId: number; status: string },
      @ConnectedSocket() client: Socket,
    ) {
      try {
        const userId = parseInt(client.handshake.query.userId as string);
        
        if (!this.agentConnections.has(userId)) {
          throw new Error('Unauthorized status update');
        }
  
        await this.packetService.updatePacketStatus(data.packetId, data.status);
        this.logger.log(`Packet ${data.packetId} status updated to ${data.status}`);
  
        // Notify relevant parties
        this.server.emit('packet_status_changed', {
          packetId: data.packetId,
          status: data.status,
          updatedBy: userId,
        });
      } catch (error) {
        this.logger.error('Status update error:', error.message);
      }
    }
  
    private async checkProximityToPackets(
      agentId: number,
      location: { lat: number; lng: number },
    ) {
      try {
        const packets = await this.packetService.findByAgent(agentId);
        const proximityThreshold = 0.05; // ~50 meters in degrees
  
        for (const packet of packets) {
          // Check origin proximity
          if (packet.origin_coordinates) {
            const distance = this.calculateDistance(location, packet.origin_coordinates);
            if (distance < proximityThreshold && packet.status === 'pending') {
              this.handleLocationReached(agentId, packet.id, 'origin');
            }
          }
  
          // Check destination proximity
          if (packet.destination_coordinates) {
            const distance = this.calculateDistance(location, packet.destination_coordinates);
            if (distance < proximityThreshold && packet.status === 'out_for_delivery') {
              this.handleLocationReached(agentId, packet.id, 'destination');
            }
          }
        }
      } catch (error) {
        this.logger.error('Proximity check error:', error.message);
      }
    }
  
    private async handleLocationReached(
      agentId: number,
      packetId: number,
      locationType: 'origin' | 'destination',
    ) {
      try {
        const newStatus = locationType === 'origin' ? 'collected' : 'delivered';
        
        await this.packetService.updatePacketStatus(packetId, newStatus);
        this.logger.log(
          `Agent ${agentId} reached ${locationType} of packet ${packetId}`,
        );
  
        // Notify the agent
        this.agentConnections.get(agentId)?.emit('location_reached', {
          packetId,
          locationType,
        });
  
        // Notify admin dashboard
        this.server.emit('packet_location_reached', {
          agentId,
          packetId,
          locationType,
          timestamp: new Date(),
        });
      } catch (error) {
        this.logger.error('Location reached handler error:', error.message);
      }
    }
  
    private calculateDistance(
      loc1: { lat: number; lng: number },
      loc2: { lat: number; lng: number },
    ): number {
      // Simple approximation for short distances
      const latDiff = Math.abs(loc1.lat - loc2.lat);
      const lngDiff = Math.abs(loc1.lng - loc2.lng);
      return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    }
  
    private cleanupOldLocations() {
      const oneHourAgo = new Date(Date.now() - 3600000);
      this.logger.log('Running location cleanup');
      // In a real implementation, you'd clean up old location records
    }
  
    // Helper method to get agent location
    public getAgentLocation(agentId: number): { lat: number; lng: number } | null {
      return this.agentLocations.get(agentId) || null;
    }
  }
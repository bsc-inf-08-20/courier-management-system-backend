export class TrackingEventDto {
    agentId: number;
    packetId: number;
    location?: { lat: number; lng: number };
    eventType?: 'location_update' | 'reached_origin' | 'reached_destination';
  }
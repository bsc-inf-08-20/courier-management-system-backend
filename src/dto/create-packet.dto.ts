// create-packet.dto.ts
export class CreatePacketDto {
  description: string;
  weight: number;
  category: string;
  instructions?: string;
  delivery_type: 'pickup' | 'delivery';
  origin_address: string;
  origin_coordinates: { lat: number; lng: number };
  destination_address: string;
  destination_coordinates: { lat: number; lng: number };
  destination_hub?: string;
  status?: string;
  sender: {
    name: string;
    email: string;
    phone_number: string;
  };
  receiver: {
    name: string;
    email: string;
    phone_number: string;
  };
}
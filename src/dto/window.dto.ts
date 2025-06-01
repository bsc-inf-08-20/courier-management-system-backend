import { IsDateString, IsNotEmpty, Validate, MinDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PickupWindowDto {
  @ApiProperty({
    description: 'Pickup start time (ISO format)',
    example: '2025-05-10T14:00:00',
  })
  @IsDateString()
  @IsNotEmpty()
  @MinDate(new Date(), { message: 'Pickup window must be in the future' })
  start: string; // ISO string format (e.g., "2025-05-10T14:00:00")

  @ApiProperty({
    description: 'Pickup end time (ISO format)',
    example: '2025-05-10T16:00:00',
  })
  @IsDateString()
  @IsNotEmpty()
  @Validate(
    (end: string, { start }: PickupWindowDto) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return endDate.getTime() - startDate.getTime() === 2 * 60 * 60 * 1000; // Exactly 2 hours
    },
    { message: 'Window must be exactly 2 hours' },
  )
  end: string;
}
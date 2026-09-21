import { ApiProperty } from '@nestjs/swagger';

export class GetMonths {
  @ApiProperty()
  month!: number;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  monthName!: string;
}

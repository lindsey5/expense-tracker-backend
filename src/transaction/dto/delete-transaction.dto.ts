import { ApiProperty } from '@nestjs/swagger';

export class DeleteTransactionResponse {
  @ApiProperty()
  message!: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";
import { TransactionResponseDto } from "./transaction.dto";

export class UpdateTransactionDto {
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;
}

export class UpdateTransactionResponse {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: TransactionResponseDto })
  transaction!: TransactionResponseDto;
}
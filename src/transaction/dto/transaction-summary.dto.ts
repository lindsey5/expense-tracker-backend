import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionSummaryResponseDto {
  @ApiProperty()
  amount!: number;

  @ApiProperty()
  change!: number;

  @ApiProperty()
  hasPreviousMonth!: boolean;
}

export class GetExpensesResponseDto extends GetTransactionSummaryResponseDto {}

export class GetIncomesResponseDto extends GetTransactionSummaryResponseDto {}

import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionSummaryResponseDto {
  @ApiProperty()
  amount!: number;

  @ApiProperty()
  change!: number;
}

export class GetExpensesResponseDto extends GetTransactionSummaryResponseDto {}

export class GetIncomesResponseDto extends GetTransactionSummaryResponseDto {}

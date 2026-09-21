import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto';
import { IsNumber, Min } from 'class-validator';
import { BudgetResponseDto } from '../common/budget.dto';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;
}

export class UpdateBudgetResponse {
  @ApiProperty()
  message!: string;

  @ApiProperty()
  budget!: BudgetResponseDto;
}

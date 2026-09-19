import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto';
import { IsNumber, Min } from 'class-validator';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto, CreateBudgetResponse } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import { GetBudgetsQueryDto, GetBudgetsResponse } from './dto/get-budget.dto';
import { GetMonths } from 'src/common/dto/month.dto';
import { GetMonthlyBudgetQueryDto, GetMonthlyBudgetResponse } from './dto/get-monthly-budget.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'create_budget' })
  @ApiOkResponse({ type: CreateBudgetResponse })
  create(
    @CurrentUserId() userId: string,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetService.create(userId, createBudgetDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'list_budgets' })
  @ApiOkResponse({ type: GetBudgetsResponse })
  findAll(@CurrentUserId() userId: string, @Query() query: GetBudgetsQueryDto) {
    return this.budgetService.findAll(userId, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'update_budget' })
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUserId() userId: string,
  ) {
    return this.budgetService.update(id, userId, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'delete_budget' })
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.budgetService.remove(id, userId);
  }

  @Get('months')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'budget_months' })
  @ApiOkResponse({ type: [GetMonths] })
  getMonths(@CurrentUserId() userId: string) {
    return this.budgetService.getMonths(userId);
  }

  @Get('monthly-budget')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'monthly_budget' })
  @ApiOkResponse({ type: GetMonthlyBudgetResponse })
  getMonthlyBudget(
    @CurrentUserId() userId: string,
    @Query() monthlyBudgetQuery: GetMonthlyBudgetQueryDto
  ) {
    return this.budgetService.monthlyBudget(
      userId,
      monthlyBudgetQuery.month,
      monthlyBudgetQuery.year
    )
  }
}

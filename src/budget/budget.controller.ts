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
import { UpdateBudgetDto, UpdateBudgetResponse } from './dto/update-budget.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ApiOkResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import { GetBudgetsQueryDto, GetBudgetsResponse } from './dto/get-budget.dto';
import { GetMonths } from 'src/common/dto/month.dto';
import {
  GetMonthlyBudgetQueryDto,
  GetMonthlyBudgetResponse,
} from './dto/get-monthly-budget.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'list_budgets' })
  @ApiOkResponse({ type: GetBudgetsResponse })
  findAll(@CurrentUserId() userId: string, @Query() query: GetBudgetsQueryDto) {
    return this.budgetService.findAll(userId, query);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'update_budget' })
  @ApiOkResponse({ type: UpdateBudgetResponse })
  update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUserId() userId: string,
  ) {
    return this.budgetService.update(id, userId, updateBudgetDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ operationId: 'delete_budget' })
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.budgetService.remove(id, userId);
  }

  @Get('months')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'budget_months' })
  @ApiOkResponse({ type: [GetMonths] })
  getMonths(@CurrentUserId() userId: string) {
    return this.budgetService.getMonths(userId);
  }

  @Get('monthly-budget')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'monthly_budget' })
  @ApiOkResponse({ type: GetMonthlyBudgetResponse })
  getMonthlyBudget(
    @CurrentUserId() userId: string,
    @Query() monthlyBudgetQuery: GetMonthlyBudgetQueryDto,
  ) {
    return this.budgetService.monthlyBudget(
      userId,
      monthlyBudgetQuery.month,
      monthlyBudgetQuery.year,
    );
  }
}

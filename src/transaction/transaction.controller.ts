import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ApiOkResponse } from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import {
  GetTransactionsDto,
  GetTransactionsResponseDto,
} from './dto/get-transaction.dto';
import {
  CreateUpdateTransactionResponse,
  GetTransactionMonths,
} from './dto/transaction.dto';
import { TransactionSummaryService } from './transaction-summary.service';
import {
  GetExpensesResponseDto,
  GetIncomesResponseDto,
} from './dto/transaction-summary.dto';
import { DateFilter } from 'src/dto/common.dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionSummaryService: TransactionSummaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: CreateUpdateTransactionResponse })
  create(
    @CurrentUserId() userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionService.create(createTransactionDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetTransactionsResponseDto })
  findAll(
    @CurrentUserId() userId: string,
    @Query() getTransactionsDto: GetTransactionsDto,
  ) {
    return this.transactionService.findAll(userId, getTransactionsDto);
  }

  @Get('incomes')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetIncomesResponseDto })
  getIncome(@CurrentUserId() userId: string, @Query() dateFilter: DateFilter) {
    const { month, year } = dateFilter;

    return this.transactionSummaryService.getIncome(userId, month, year);
  }

  @Get('expenses')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetExpensesResponseDto })
  getExpense(@CurrentUserId() userId: string, @Query() dateFilter: DateFilter) {
    const { month, year } = dateFilter;

    return this.transactionSummaryService.getExpense(userId, month, year);
  }

  @Get('months')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: [GetTransactionMonths] })
  getMonths(@CurrentUserId() userId: string) {
    return this.transactionService.getMonths(userId);
  }
}

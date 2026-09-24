import { Controller, Get, Post, Body, UseGuards, Query, Delete, Param, Patch } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, CreateTransactionResponse } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ApiOkResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import {
  GetTransactionsDto,
  GetTransactionsResponseDto,
} from './dto/get-transaction.dto';
import {
  TransactionResponseDto,
} from './dto/transaction.dto';
import { TransactionSummaryService } from './transaction-summary.service';
import {
  GetExpensesResponseDto,
  GetIncomesResponseDto,
} from './dto/transaction-summary.dto';
import { DateFilter } from 'src/dto/common.dto';
import { GetMonths } from 'src/common/dto/month.dto';
import { DeleteTransactionResponse } from './dto/delete-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionSummaryService: TransactionSummaryService,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'create_transaction' })
  @ApiOkResponse({ type: CreateTransactionResponse })
  create(
    @CurrentUserId() userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionService.create(createTransactionDto, userId);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'list_transactions' })
  @ApiOkResponse({ type: GetTransactionsResponseDto })
  findAll(
    @CurrentUserId() userId: string,
    @Query() getTransactionsDto: GetTransactionsDto,
  ) {
    return this.transactionService.findAll(userId, getTransactionsDto);
  }

  @Get('incomes')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'get_transaction_incomes' })
  @ApiOkResponse({ type: GetIncomesResponseDto })
  getIncome(@CurrentUserId() userId: string, @Query() dateFilter: DateFilter) {
    const { month, year } = dateFilter;

    return this.transactionSummaryService.getIncome(userId, month, year);
  }

  @Get('expenses')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'get_transaction_expenses' })
  @ApiOkResponse({ type: GetExpensesResponseDto })
  getExpense(@CurrentUserId() userId: string, @Query() dateFilter: DateFilter) {
    const { month, year } = dateFilter;

    return this.transactionSummaryService.getExpense(userId, month, year);
  }

  @Get('months')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'list_transaction_months' })
  @ApiOkResponse({ type: [GetMonths] })
  getMonths(@CurrentUserId() userId: string) {
    return this.transactionService.getMonths(userId);
  }

  @Get('recent')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'list_transaction_recent' })
  @ApiOkResponse({ type: [TransactionResponseDto] })
  getRecent(@CurrentUserId() userId: string) {
    return this.transactionService.getRecent(userId);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'update_transaction' })
  @ApiOkResponse({ type: UpdateTransactionDto })
  update(
    @CurrentUserId() userId: string, 
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionService.update(id, updateTransactionDto.amount, userId);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'delete_transaction' })
  @ApiOkResponse({ type: DeleteTransactionResponse })
  delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.transactionService.delete(userId, id);
  }

}

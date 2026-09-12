import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import { GetTransactionsDto, GetTransactionsResponseDto } from './dto/get-transaction.dto';
import { CreateUpdateTransactionResponse } from './dto/transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateTransactionDto })
  @ApiOkResponse({ type: CreateUpdateTransactionResponse })
  create(
    @CurrentUserId() userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionService.create(
      createTransactionDto,
      userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetTransactionsResponseDto })
  findAll(
    @CurrentUserId() userId: string,
    @Query() getTransactionsDto: GetTransactionsDto
  ) {
    return this.transactionService.findAll(userId, getTransactionsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}

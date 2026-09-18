import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ApiOkResponse } from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import { BudgetResponseDto } from './common/budget.dto';
import { GetBudgetQueryDto } from './dto/get-budget.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: BudgetResponseDto })
  create(
    @CurrentUserId() userId: string,
    @Body() createBudgetDto: CreateBudgetDto
  ) {
    return this.budgetService.create(userId, createBudgetDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUserId() userId: string,
    @Query() query: GetBudgetQueryDto,
  ) {
    return this.budgetService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string, 
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUserId() userId: string,
  ) {
    return this.budgetService.update(id, userId, updateBudgetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @CurrentUserId() userId: string,
    @Param('id') id: string
  ) {
    return this.budgetService.remove(id, userId);
  }
}

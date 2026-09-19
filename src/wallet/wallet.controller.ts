import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import {
  CreateWalletDto,
  CreateWalletResponseDto,
} from './dto/create-wallet.dto';
import {
  UpdateWalletDto,
  UpdateWalletResponseDto,
} from './dto/update-wallet.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import { GetTotalBalance, GetWalletsResponseDto } from './dto/get-wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'create_wallet' })
  @ApiOkResponse({ type: CreateWalletResponseDto })
  create(
    @CurrentUserId() userId: string,
    @Body() createWalletDto: CreateWalletDto,
  ) {
    return this.walletService.create(userId, createWalletDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'list_wallets' })
  @ApiOkResponse({ type: GetWalletsResponseDto })
  findAll(@CurrentUserId() userId: string) {
    return this.walletService.findAll(userId);
  }

  @Get('total-balance')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'get_total_balance' })
  @ApiOkResponse({ type: GetTotalBalance })
  getTotalBalance(@CurrentUserId() userId: string) {
    return this.walletService.getTotalBalance(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'update_wallet' })
  @ApiOkResponse({ type: UpdateWalletResponseDto })
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(id, updateWalletDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'delete_wallet' })
  remove(@Param('id') id: string) {
    return this.walletService.remove(+id);
  }
}

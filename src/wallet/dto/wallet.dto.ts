import { WalletType } from 'generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class WalletDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: WalletType,
    example: WalletType.E_WALLET,
  })
  type!: WalletType;

  @ApiProperty()
  balance!: number;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

export class WalletResponseWrapperDto {
  @ApiProperty({ type: WalletDto })
  wallet!: WalletDto;

  @ApiProperty()
  message!: string;
}

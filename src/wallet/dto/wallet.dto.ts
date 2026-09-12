import { ApiProperty } from '@nestjs/swagger';
import { WalletType } from 'generated/prisma/enums';

export class WalletResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    userId!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty({ enum: WalletType })
    type!: WalletType;

    @ApiProperty({
        example: 1500.5,
        description: 'Wallet balance',
    })
    balance!: number;

    @ApiProperty({ type: Date })
    createdAt!: Date;

    @ApiProperty({ type: Date })
    updatedAt!: Date;
}
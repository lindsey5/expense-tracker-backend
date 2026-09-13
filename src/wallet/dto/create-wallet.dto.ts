import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { WalletType } from 'generated/prisma/enums';
import { WalletResponseWrapperDto } from './wallet.dto';

export class CreateWalletDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name!: string;

    @ApiProperty({
        enum: WalletType,
        example: WalletType.E_WALLET,
    })
    @IsEnum(WalletType)
    type!: WalletType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    balance?: number;
}

export class CreateWalletResponseDto extends WalletResponseWrapperDto {}
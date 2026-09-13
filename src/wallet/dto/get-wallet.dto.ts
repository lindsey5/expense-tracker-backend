import { ApiProperty } from "@nestjs/swagger";
import { WalletDto } from "./wallet.dto";

export class GetWalletsResponseDto {
    @ApiProperty({ type: [WalletDto] })
    wallets!: WalletDto[];
}

export class GetTotalBalance {
    @ApiProperty()
    totalBalance!: number;
    
    @ApiProperty()
    totalWallets!: number;
}
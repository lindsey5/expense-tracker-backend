import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UserLookupDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}

export class UserLookupResponse {
    @ApiProperty()
    message!: string;
}
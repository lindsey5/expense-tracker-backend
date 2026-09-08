import { ApiProperty } from '@nestjs/swagger';
import {
    isEmail,
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    MinLength,
} from 'class-validator';

export class SignupUserDTO {
    @ApiProperty()
    @IsEmail()
    email!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    password!: string;
}

export class SignupResponse {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    message!: string;
}

export class UserResponseDto {
    @ApiProperty()
    id: number = 0;

    @ApiProperty()
    googleId: string = '';

    @ApiProperty()
    email: string = '';

    @ApiProperty()
    firstName: string = '';

    @ApiProperty()
    lastName: string = '';

    @ApiProperty({ type: String, nullable: true })
    avatar: string | null = null;

    @ApiProperty()
    isVerified: boolean = false;
}

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string = '';

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto = new UserResponseDto();
}

export class VerifyDTO {
    @ApiProperty({ example: '123456', description: '6-digit verification code', }) 
    @IsString() 
    @IsNotEmpty() 
    @Length(6, 6)
    verificationCode!: string;
}

export class VerifyResponse {
    @ApiProperty()
    message!: string
}

export class LoginUserDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsString() 
    @IsNotEmpty()
    @ApiProperty()
    password!: string;
}
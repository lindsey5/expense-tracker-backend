import { ApiProperty } from '@nestjs/swagger';
import {
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
  id: string = '';

  @ApiProperty()
  email: string = '';

  @ApiProperty()
  firstName: string = '';

  @ApiProperty()
  lastName: string = '';

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
  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  verificationCode!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class VerifyResponse {
  @ApiProperty()
  message!: string;
}

export class ResendDTO {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ResendResponse {
  @ApiProperty()
  message!: string;
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

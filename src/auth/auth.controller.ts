import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  LoginUserDTO,
  ResendDTO,
  ResendResponse,
  SignupResponse,
  SignupUserDTO,
  VerifyDTO,
  VerifyResponse,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ operationId: 'signup' })
  @ApiBody({ type: SignupUserDTO })
  @ApiOkResponse({ type: SignupResponse })
  async signup(@Body() signupDTO: SignupUserDTO) {
    return this.authService.signup(signupDTO);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'verify_email' })
  @ApiBody({ type: VerifyDTO })
  @ApiOkResponse({ type: VerifyResponse })
  async verifyUser(@Body() verifyDTO: VerifyDTO) {
    return this.authService.verifyUser(
      verifyDTO.email,
      verifyDTO.verificationCode,
    );
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'resend_verification' })
  @ApiBody({ type: ResendDTO })
  @ApiOkResponse({ type: ResendResponse })
  async resend(@Body() resendDTO: ResendDTO) {
    return this.authService.resend(resendDTO.email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'login' })
  @ApiBody({ type: LoginUserDTO })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }
}
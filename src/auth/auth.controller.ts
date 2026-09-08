import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { AuthResponseDto, LoginUserDTO, SignupResponse, SignupUserDTO, VerifyDTO, VerifyResponse } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOkResponse({ type: AuthResponseDto })
  async googleCallback(@Req() req: any) {
    return this.authService.googleLogin(req.user);
  }

  @Post('signup')
  @ApiBody({ type: SignupUserDTO })
  @ApiOkResponse({ type: SignupResponse })
  async signup(@Body() signupDTO: SignupUserDTO) {
    return this.authService.signup(signupDTO);
  }

  @Post('verify/:id')
  @ApiBody({ type: VerifyDTO })
  @ApiOkResponse({ type: VerifyResponse })
  async verifyUser(@Body() verifyDTO: VerifyDTO, @Param('id') id: string) {
    return this.authService.verifyUser(id, verifyDTO.verificationCode);
  }

  @Post('login')
  @ApiBody({ type: LoginUserDTO })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.login(loginUserDTO);
  }
}
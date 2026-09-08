import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { AuthResponseDto, LoginUserDTO, SignupResponse, SignupUserDTO, VerifyDTO, VerifyResponse } from './dto/auth.dto';
import { type Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(@Req() req: any) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOkResponse({ type: AuthResponseDto })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user); 
    const redirectUri = this.configService.getOrThrow<string>("GOOGLE_REDIRECT_URI"); 
    const params = new URLSearchParams({ accessToken: result.accessToken, user: JSON.stringify(result.user)});

    return res.redirect( `${redirectUri}?${params.toString()}`, );
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
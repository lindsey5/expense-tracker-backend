import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserLookupDto, UserLookupResponse } from './dto/get-user.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/lookup')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserLookupResponse })
  async userLookup(@Body() userLookupDto: UserLookupDto) {
    return this.userService.userLookup(userLookupDto.email);
  }
}
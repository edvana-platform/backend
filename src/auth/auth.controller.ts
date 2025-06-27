/* eslint-disable */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
}

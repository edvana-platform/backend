/* eslint-disable */
import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, LogoutDto } from 'src/users/dto/user.dto';
import { ForgotPasswordDto } from 'src/users/dto/user.dto';
import { ResetPasswordDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const { email, phone, password } = body;

    if (!email && !phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    return this.authService.login(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }
  @Post('reset-password')
async resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto);
}
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    const { token } = dto;
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.logout(dto.token); 
  }
}

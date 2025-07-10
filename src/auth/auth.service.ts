/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from 'src/users/dto/user.dto';
import { ForgotPasswordDto } from 'src/users/dto/user.dto';
import { ResetPasswordDto } from 'src/users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string, isEmail: boolean) {
    const user = isEmail
      ? await this.usersService.findByEmail(identifier)
      : await this.usersService.findByPhone(identifier);

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginDto: LoginUserDto) {
    const { email, phone, password } = loginDto;
    const identifier = email || phone;
    const isEmail = !!email;

    const user = await this.validateUser(identifier, password, isEmail);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email, phone } = dto;

    if (!email && !phone) {
      throw new NotFoundException('Please provide an email or phone number');
    }

    const user = email
      ? await this.usersService.findByEmail(email)
      : await this.usersService.findByPhone(phone);

    if (!user) {
      throw new NotFoundException('User not found with provided credentials');
    }

    const token = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '15m' } 
    );


    return {
      message: 'Password reset link has been sent',
      token, 
    };
  }
  async resetPassword(dto: ResetPasswordDto) {
  const { token, newPassword } = dto;

  try {
    const decoded = this.jwtService.verify(token);
    const userId = decoded.sub;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Password reset successful' };
  } catch (err) {
    throw new UnauthorizedException('Invalid or expired token');
  }
}
}

/* eslint-disable */
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from 'src/users/dto/user.dto';
import { ForgotPasswordDto } from 'src/users/dto/user.dto';
import { ResetPasswordDto } from 'src/users/dto/user.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
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
    throw new BadRequestException('Provide email or phone number');
  }

  const user = email
    ? await this.usersService.findByEmail(email)
    : await this.usersService.findByPhone(phone);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const identifier = email || phone;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  await this.redisService.set(`otp:${identifier}`, otp, 600); // Store for 10 minutes

  // Send via email
  await this.emailService.send({
    to: user.email,
    subject: 'Password Reset OTP',
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });

  return { message: 'OTP sent to your email' };
}

async resetPassword(dto: ResetPasswordDto) {
  const { email, otp, newPassword } = dto;

  const storedOtp = await this.redisService.get(`otp:${email}`);

  if (!storedOtp || storedOtp !== otp) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  const user = await this.usersService.findByEmail(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await this.usersService.updatePassword(user.id, hashedPassword);

  await this.redisService.del(`otp:${email}`); // Remove used OTP

  return { message: 'Password reset successful' };
}
}

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
      ? await this.usersService.findByEmail(identifier ?? "")
      : await this.usersService.findByPhone(identifier ?? "");

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
    if (!identifier) {
    throw new BadRequestException('Email or phone is required');
  }
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
    ? await this.usersService.findByEmail(email || '')
  : await this.usersService.findByPhone(phone || '');

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

async logout(token: string) {
  if (!token) {
    throw new BadRequestException('Token is required');
  }

  try {
    const payload = this.jwtService.decode(token);
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    // Verify token first to ensure it's valid
    this.jwtService.verify(token);

    const expirationTime = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (expirationTime < currentTime) {
      return { message: 'Token already expired' };
    }

    const ttl = expirationTime - currentTime;
    await this.redisService.set(`blacklist:${token}`, 'true', ttl);

    return { message: 'Successfully logged out' };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return { message: 'Token already expired' };
    }
    throw new UnauthorizedException('Error logging out');
  }
}

  // Validate token method (without blacklist check)
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);  // If the token is expired, it will throw an error
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

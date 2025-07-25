/* eslint-disable */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail', // or 'smtp.example.com'
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async send({ to, subject, html }: { to: string; subject: string; html: string }) {
    await this.transporter.sendMail({
      from: `"Edvana" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}

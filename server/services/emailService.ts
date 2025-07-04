import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import * as db from '../db';

export class EmailService {
  // Инициализируем свойство при объявлении
  private transporter: nodemailer.Transporter = null!;

  constructor() {
    // Проверяем режим работы: OAuth или SMTP
    if (process.env.GMAIL_OAUTH_CLIENT_ID && process.env.GMAIL_OAUTH_CLIENT_SECRET && 
        process.env.GMAIL_OAUTH_REFRESH_TOKEN) {
      this.setupOAuth2Transport();
    } else {
      // Запасной вариант - обычный SMTP
      this.setupSMTPTransport();
    }
    
    // Добавим проверку, что переменная GMAIL_USER указана
    if (!process.env.GMAIL_USER) {
      console.error('ОШИБКА: Не указан GMAIL_USER в файле .env');
    }
  }

  private async setupOAuth2Transport() {
    try {
      // Настройка OAuth2
      const OAuth2 = google.auth.OAuth2;
      const oauth2Client = new OAuth2(
        process.env.GMAIL_OAUTH_CLIENT_ID,
        process.env.GMAIL_OAUTH_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN
      });

      // Получаем access token
      const accessToken = await new Promise<string>((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err || !token) {
            console.error('Error getting access token', err);
            reject(err || new Error('Access token is null'));
            return;
          }
          resolve(token);
        });
      });

      // Создаем транспорт с OAuth2
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
          clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
          accessToken
        }
      });

      console.log('Gmail OAuth2 транспорт настроен успешно');
      console.log(`Используемый email: ${process.env.GMAIL_USER}`);
    } catch (error) {
      console.error('Ошибка настройки OAuth2:', error);
      // Если OAuth не получилось, используем обычный SMTP
      this.setupSMTPTransport();
    }
  }

  private setupSMTPTransport() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    console.log('Gmail SMTP транспорт настроен (запасной вариант)');
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject,
        html,
      });

      // Логируем успешную отправку
      await db.addLog({
        email: to,
        status: 'success',
        template: html,
      });

      return true;
    } catch (error) {
      console.error('Ошибка отправки email:', error);
      
      // Логируем ошибку
      await db.addLog({
        email: to,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        template: html,
      });

      return false;
    }
  }

  async sendBulkEmails(emails: string[], subject: string, html: string): Promise<{
    success: number;
    failed: number;
    details: Array<{ email: string; success: boolean; error?: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      details: [] as Array<{ email: string; success: boolean; error?: string }>,
    };

    for (const email of emails) {
      try {
        const sent = await this.sendEmail(email, subject, html);
        if (sent) {
          results.success++;
          results.details.push({ email, success: true });
        } else {
          results.failed++;
          results.details.push({ email, success: false, error: 'Failed to send' });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

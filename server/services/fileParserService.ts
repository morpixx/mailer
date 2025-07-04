import Papa from 'papaparse';
import * as db from '../db';

export class FileParserService {
  /**
   * Парсит содержимое файла и извлекает email адреса
   * Поддерживаемые форматы:
   * - CSV файлы
   * - Текстовые файлы с разделителями (запятая, точка с запятой, новая строка)
   * - Формат: email:email1:email2...
   */
  parseEmailsFromContent(content: string, filename: string): string[] {
    const emails: string[] = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

    try {
      // Если файл CSV, используем papaparse
      if (filename.toLowerCase().endsWith('.csv')) {
        const parsed = Papa.parse(content, {
          header: false,
          skipEmptyLines: true,
        });

        parsed.data.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach((cell: any) => {
              const matches = String(cell).match(emailRegex);
              if (matches) {
                emails.push(...matches);
              }
            });
          }
        });
      } else {
        // Для текстовых файлов парсим по разделителям
        const lines = content.split(/[\r\n]+/);
        
        lines.forEach(line => {
          // Разделяем по запятым, точкам с запятой, двоеточиям
          const parts = line.split(/[,:;]/);
          
          parts.forEach(part => {
            const matches = part.trim().match(emailRegex);
            if (matches) {
              emails.push(...matches);
            }
          });
        });
      }

      // Удаляем дубликаты и приводим к нижнему регистру
      return [...new Set(emails.map(email => email.toLowerCase()))];
    } catch (error) {
      console.error('Error parsing file:', error);
      return [];
    }
  }

  /**
   * Сохраняет email адреса в базу данных
   */
  async saveEmailsToDatabase(emails: string[]): Promise<{
    saved: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      saved: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Получаем все аккаунты заранее для проверки дубликатов
    const existingAccounts = await db.getAllAccounts();
    const existingEmails = new Set(existingAccounts.map(acc => acc.email));

    for (const email of emails) {
      try {
        // Более эффективная проверка существования email
        if (existingEmails.has(email)) {
          results.skipped++;
          continue;
        }

        // Сохраняем новый email
        await db.addAccount(email);
        results.saved++;
      } catch (error) {
        results.errors.push(`Failed to save ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Валидирует email адрес
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

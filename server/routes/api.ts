import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { getAllAccounts, deleteAccount, clearAccounts, getAllLogs } from '../db';
import { FileParserService } from '../services/fileParserService';
import { EmailService } from '../services/emailService';

const router = express.Router();
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10 МБ
});
const fileParserService = new FileParserService();
const emailService = new EmailService();

// Загрузка файла с email адресами
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        
        // Парсим email адреса из файла
        const emails = fileParserService.parseEmailsFromContent(fileContent, req.file.originalname);
        
        if (emails.length === 0) {
            fs.unlinkSync(req.file.path); // Видаляємо файл якщо немає email-ів
            return res.status(400).json({ error: 'No valid email addresses found in file' });
        }

        // Сохраняем в базу данных
        const results = await fileParserService.saveEmailsToDatabase(emails);
        
        fs.unlinkSync(req.file.path); // Видаляємо файл після успішної обробки
        res.json({
            message: 'File processed successfully',
            totalEmails: emails.length,
            saved: results.saved,
            skipped: results.skipped,
            errors: results.errors,
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); // Видаляємо файл при будь-якій помилці
        }
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Получение всех email адресов
router.get('/accounts', async (req, res) => {
    try {
        const allAccounts = await getAllAccounts();
        res.json(allAccounts);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Удаление email адреса
router.delete('/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteAccount(parseInt(id));
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Очистка всех email адресов
router.delete('/accounts', async (req, res) => {
    try {
        await clearAccounts();
        res.json({ message: 'All accounts deleted successfully' });
    } catch (error) {
        console.error('Clear accounts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отправка email рассылки
router.post('/send', async (req, res) => {
    try {
        const { subject, template } = req.body;

        if (!subject || !template) {
            return res.status(400).json({ error: 'Subject and template are required' });
        }

        // Получаем все email адреса
        const allAccounts = await getAllAccounts();
        
        if (allAccounts.length === 0) {
            return res.status(400).json({ error: 'No email addresses found' });
        }

        const emails = allAccounts.map(account => account.email);

        // Отправляем рассылку
        const results = await emailService.sendBulkEmails(emails, subject, template);

        res.json({
            message: 'Email sending completed',
            total: emails.length,
            success: results.success,
            failed: results.failed,
            details: results.details,
        });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Получение логов отправки
router.get('/logs', async (req, res) => {
    try {
        const logs = await getAllLogs();
        res.json(logs.slice(-50)); // Последние 50 записей
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

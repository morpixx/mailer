import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createTables } from './db';
import apiRoutes from './routes/api';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Исправьте пути к клиентским файлам
const clientDistPath = path.resolve(__dirname, '../client/dist');
console.log('Путь к клиентским файлам:', clientDistPath);

// Обслуживаем статические файлы клиента
app.use(express.static(clientDistPath));

// Создаем таблицы при запуске
createTables();

// API роуты
app.use('/api', apiRoutes);

// Обслуживаем фронтенд
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

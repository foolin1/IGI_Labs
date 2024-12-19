import express from 'express';
import jwt from 'jsonwebtoken';
import { MongoProvider } from './services/mongoProvider.js';
import bodyParser from 'body-parser';
import cors from 'cors'

const app = express();
const port = 3001;
const JWT_SECRET = 'your_secret_key'; // Замените на надёжный секретный ключ
const url = 'mongodb://admin:admin123@localhost:27017';
const dbName = 'AutoCar';
const mongoProvider = new MongoProvider(url, dbName);

// Middleware для обработки JSON в теле запроса
app.use(bodyParser.json());

app.use(cors())

// Функция для отправки ответа
const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

// Функция для аутентификации
const authenticate = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Authorization token missing');

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // Возвращаем информацию о пользователе
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Маршруты
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await mongoProvider.login(username, password);
    const token = jwt.sign(
      { userId: result.userId, username: result.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    ); // Генерируем токен
    sendResponse(res, 200, { message: 'Login successful', token });
  } catch (error) {
    sendResponse(res, 401, { error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await mongoProvider.register(username, password);
    const token = jwt.sign(
      { userId: result.userId, username: result.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    ); // Генерируем токен
    sendResponse(res, 201, { message: 'Registration successful', token });
  } catch (error) {
    sendResponse(res, 400, { error: error.message });
  }
});

app.get('/api/Validate', (req, res) => {
  try {
    authenticate(req);
    sendResponse(res, 200, { isAuthenticated: true });
  } catch (error) {
    sendResponse(res, 200, { isAuthenticated: false });
  }
});

app.get('/api/Autos', async (req, res) => {
  const { id } = req.query;
  try {
    const user = authenticate(req);
    const data = id
      ? await mongoProvider.get('Auto', id, user.userId)
      : await mongoProvider.get('Auto', null, user.userId);
    sendResponse(res, 200, data);
  } catch (error) {
    sendResponse(res, 401, { error: error.message });
  }
});

app.get('/api/News', async (req, res) => {
  try {
    const data = await mongoProvider.get('NewsArticle', null, null, false)
    sendResponse(res, 200, data);
  } catch (error) {
    sendResponse(res, 500, { error: error.message });
  }
});

app.get('/api/ParkingSpots', async (req, res) => {
  try {
    const data = await mongoProvider.get('ParkingSpot', null, null, false)
    sendResponse(res, 200, data);
  } catch (error) {
    sendResponse(res, 500, { error: error.message });
  }
});

app.post('/api/Autos', async (req, res) => {
  const user = authenticate(req);
  const data = req.body;
  try {
    const newObject = await mongoProvider.add('Auto', data, user.userId);
    sendResponse(res, 201, { message: 'Object added successfully', newObject });
  } catch (error) {
    sendResponse(res, 400, { error: error.message });
  }
});

app.put('/api/Autos', async (req, res) => {
  const user = authenticate(req);
  const putData = req.body;
  try {
    await mongoProvider.remove('Auto', putData._id, user.userId);
    const newObject = await mongoProvider.add('Auto', putData, user.userId);
    sendResponse(res, 201, { message: 'Object updated successfully', newObject });
  } catch (error) {
    sendResponse(res, 400, { error: error.message });
  }
});

app.delete('/api/Autos', async (req, res) => {
  const { id } = req.query;
  try {
    const user = authenticate(req);
    if (id) {
      const result = await mongoProvider.remove('Auto', id, user.userId);
      sendResponse(res, 200, { message: 'Object deleted successfully' });
    } else {
      sendResponse(res, 400, { error: 'ID is required for deletion' });
    }
  } catch (error) {
    sendResponse(res, 401, { error: error.message });
  }
});

// Старт сервера
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});

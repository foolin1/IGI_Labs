import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { MongoProvider } from './services/mongoProvider.js';

const hostname = '127.0.0.1';
const port = 3000;

const JWT_SECRET = 'your_secret_key'; // Замените на надёжный секретный ключ
const url = 'mongodb://admin:admin123@localhost:27017';
const dbName = 'AutoCar';
const mongoProvider = new MongoProvider(url, dbName);

const parseBody = async (req) => {
    let body = '';
    for await (const chunk of req) {
        body += chunk;
    }
    return JSON.parse(body);
};

const sendResponse = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};

const authenticate = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Authorization token missing');

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Проверяем токен
        return decoded; // Возвращаем информацию о пользователе
    } catch (error) {
        throw new Error('Invalid token');
    }
};

const server = createServer(async (req, res) => {
    try {
        const urlObj = new URL(req.url, `http://${hostname}`);
        const [_, api, collection] = urlObj.pathname.split('/');
        const id = urlObj.searchParams.get('id');

        if (api !== 'api') {
            sendResponse(res, 404, { error: 'Route not found' });
            return;
        }

        await mongoProvider.connect();

        await mongoProvider.migrate();

        switch (req.method) {
            case 'POST':
                if (collection === 'login') {
                    const { username, password } = await parseBody(req);
                    try {
                        const result = await mongoProvider.login(username, password);
                        const token = jwt.sign({ userId: result.userId, username: result.username }, JWT_SECRET, { expiresIn: '1h' }); // Генерируем токен
                        sendResponse(res, 200, { message: 'Login successful', token });
                    } catch (error) {
                        sendResponse(res, 401, { error: error.message });
                    }
                } else if (collection === 'register') {
                    const { username, password } = await parseBody(req);
                    try {
                        const result = await mongoProvider.register(username, password);
                        const token = jwt.sign({ userId: result.userId, username: result.username }, JWT_SECRET, { expiresIn: '1h' }); // Генерируем токен
                        sendResponse(res, 201, { message: 'Registration successful', token });
                    } catch (error) {
                        sendResponse(res, 400, { error: error.message });
                    }
                } else {
                    if (collection === 'Auto') {
                        const user = authenticate(req); // Проверяем авторизацию
                        const data = await parseBody(req);
                        const newObject = await mongoProvider.add(collection, data, user.userId);
                        sendResponse(res, 201, { message: 'Object added successfully', newObject });
                    } else {
                        sendResponse(res, 403, { message: 'Forbidden to update' });
                    }
                }
                break;

            case 'GET':
                if (collection === 'Auto') {
                    try {
                        const user = authenticate(req); // Проверяем авторизацию
                        const data = id
                            ? await mongoProvider.get(collection, id, user.userId)
                            : await mongoProvider.get(collection, null, user.userId);
                        sendResponse(res, 200, data);
                    } catch (error) {
                        sendResponse(res, 401, { error: error.message });
                    }
                } else {
                    const data = id
                        ? await mongoProvider.get(collection, id)
                        : await mongoProvider.get(collection);
                    sendResponse(res, 200, data);
                }
                break;

            case 'PUT':
                if (collection === 'Auto') {
                    try {
                        const user = authenticate(req); // Проверяем авторизацию
                        const putData = await parseBody(req);
                        await mongoProvider.remove(collection, putData._id, user.userId);
                        const newObject = await mongoProvider.add(collection, putData, user.userId);
                        sendResponse(res, 201, { message: 'Object updated successfully', newObject });
                    } catch (error) {
                        sendResponse(res, 401, { error: error.message });
                    }
                } else {
                    sendResponse(res, 403, { message: 'Forbidden to update' });
                }
                break;

            case 'DELETE':
                if (collection === 'Auto') {
                    try {
                        const user = authenticate(req); // Проверяем авторизацию
                        if (id) {
                            const result = await mongoProvider.remove(collection, id, user.userId);
                            if (result) {
                                sendResponse(res, 200, { message: 'Object deleted successfully' });
                            } else {
                                sendResponse(res, 404, { error: 'Object not found' });
                            }
                        } else {
                            sendResponse(res, 400, { error: 'ID is required for deletion' });
                        }
                    } catch (error) {
                        sendResponse(res, 401, { error: error.message });
                    }
                } else {
                    sendResponse(res, 403, { message: 'Forbidden to delete' });
                }
                break;

            default:
                sendResponse(res, 405, { error: 'Method not allowed' });
                break;
        }
    } catch (error) {
        sendResponse(res, 500, { error: error.message });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
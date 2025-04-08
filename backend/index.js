import express from 'express';
import jwt from 'jsonwebtoken';
import { MongoProvider } from './services/mongoProvider.js';
import bodyParser from 'body-parser';
import cors from 'cors'
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const app = express();
const port = 3001;
const JWT_SECRET = 'your_secret_key';
const url = process.env.MONGO_URL || "mongodb://admin:admin123@localhost:27017";
const dbName = 'AutoCar';
const mongoProvider = new MongoProvider(url, dbName);

const GOOGLE_CLIENT_ID = '684288937330-gjkt6saqkmj1jadj4onmgj7ile7qj9di.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_CALLBACK_URL = 'http://localhost:3001/api/auth/google/callback';

await mongoProvider.connect();
//await mongoProvider.migrate();

app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Authorization token missing');
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};


// Настройка стратегии Google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await mongoProvider.findUserByGoogleId(profile.id);
        if (!user) {
          user = await mongoProvider.createGoogleUser({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


// Сериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

const sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

// Эндпоинт для аутентификации через Google
app.get(
  '/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback-эндпоинт
app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate token' });
    }
  }
);


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await mongoProvider.login(username, password);
    const token = jwt.sign(
      { userId: result.userId, username: result.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    ); 
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
    ); 
    sendResponse(res, 201, { message: 'Registration successful', token });
  } catch (error) {
    sendResponse(res, 400, { error: error.message });
  }
});

app.get('/api/Validate', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Authorization token missing');
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ isAuthenticated: true, user: decoded });
  } catch (error) {
    res.status(200).json({ isAuthenticated: false });
  }
});

app.get('/api/Autos', verifyToken, async (req, res) => {
  try {
    console.log(`${JSON.stringify(req.user)}`)
    const data = await mongoProvider.get('Auto', null, req.user.userId);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
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

app.post('/api/Autos', verifyToken, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Authorization token missing');
  const user = jwt.verify(token, JWT_SECRET);
  const data = req.body;
  try {
    const newObject = await mongoProvider.add('Auto', data, req.user.userId);
    sendResponse(res, 201, { message: 'Object added successfully', newObject });
  } catch (error) {
    sendResponse(res, 400, { error: error.message });
  }
});

app.put('/api/Autos', verifyToken, async (req, res) => {
  const putData = req.body;
  try {
    await mongoProvider.remove('Auto', putData._id, req.user.userId);
    const newObject = await mongoProvider.add('Auto', putData, req.user.userId);
    sendResponse(res, 201, { message: 'Object updated successfully', newObject });
  } catch (error) {
    sendResponse(res, 400, { error: error.message });
  }
});

app.delete('/api/Autos', verifyToken, async (req, res) => {
  const { id } = req.query;
  try {
    if (id) {
      const result = await mongoProvider.remove('Auto', id, req.user.userId);
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

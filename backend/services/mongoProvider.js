import mongoose from 'mongoose';
import * as crypto from 'crypto';

const autoSchema = new mongoose.Schema({
    number: String,
    model: String,
    bodyType: String,
    userId: String
});

const Auto = mongoose.model('Auto', autoSchema);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String, // Добавлено для хранения Google ID
    email: String, // Email пользователя
    name: String, // Имя пользователя
});

const User = mongoose.model('User', userSchema);

const parkingSpotSchema = new mongoose.Schema({
    price: Number,
    isFree: Boolean,
    number: String
});

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);

const newsArticleSchema = new mongoose.Schema({
    title: String,
    description: String
});

const NewsArticle = mongoose.model('NewsArticle', newsArticleSchema);

export class MongoProvider {
    constructor(url, dbName) {
        this.url = url;
        this.dbName = dbName;
        this.models = {
            User,
            Auto,
            ParkingSpot,
            NewsArticle,
        };
    }

    async connect() {
        await mongoose.connect(this.url, {
            dbName: this.dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    }

    async login(username, password) {
        await this.connect();

        // Найти пользователя по имени
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }

        // Проверить хэш пароля
        const isPasswordValid = crypto.createHash('md5').update(password).digest('hex') == user.password;
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Успешный вход
        return {
            message: 'Login successful',
            userId: user._id,
            username: user.username,
        };
    }

    async register(username, password) {
        await this.connect();

        // Проверить, существует ли уже пользователь
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new Error('Username is already taken');
        }

        // Хэшировать пароль
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        // Создать нового пользователя
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        // Сохранить пользователя в базе
        await newUser.save();

        return {
            message: 'Registration successful',
            userId: newUser._id,
            username: newUser.username,
        };
    }

    async get(modelName, objectId = null, userId = null, authorize = true) {
        await this.connect();

        const Model = this.models[modelName];
        if (!Model) throw new Error(`Model "${modelName}" not found`);

        if (authorize) return objectId ? await Model.find({ _id: objectId }) : await Model.find({  });

        return objectId ? await Model.find({ userId, _id: objectId }) : await Model.find({ userId });
    }

    async add(modelName, object, userId) {
        await this.connect();
    
        const Model = this.models[modelName];
        if (!Model) throw new Error(`Model "${modelName}" not found`);
    
        if (modelName === 'Auto') {
            if (!userId) throw new Error('userId is required for adding an Auto');
    
            const userExists = await User.findById(userId);
            if (!userExists) throw new Error('User not found for the given userId');
        }
        
        object.userId = userId
        const newObject = new Model(object);
        return await newObject.save();
    }    

    async remove(modelName, objectId, userId) {
        await this.connect();

        const Model = this.models[modelName];

        const objectToRemove = await Model.find({ userId, _id: objectId }) 
        if (!objectToRemove) throw new Error('Object not found');

        if (!Model) throw new Error(`Model "${modelName}" not found`);

        if (modelName === 'Auto') {
            if (!userId) throw new Error('userId is required for adding an Auto');
    
            const userExists = await User.findById(userId);
            if (!userExists) throw new Error('User not found for the given userId');
        }

        await Model.findByIdAndDelete({ userId, _id: objectId })
    }

    async migrate() {
        // Очистить существующие данные
        if ((await this.models.User.find({})).length > 0)
            await this.models.User.deleteMany({});
        if ((await this.models.Auto.find({})).length > 0)
            await this.models.Auto.deleteMany({});
        if ((await this.models.ParkingSpot.find({})).length > 0)
            await this.models.ParkingSpot.deleteMany({});
        if ((await this.models.NewsArticle.find({})).length > 0)    
            await this.models.NewsArticle.deleteMany({});

        console.log('Collections cleared');

        // Миграция данных
        console.log('Starting migration...');

        // Users
        const users = Array.from({ length: 10 }, (_, i) => ({
            username: `user${i + 1}`,
            password: crypto.createHash('md5').update(`password${i + 1}`).digest('hex'),
        }));
        const createdUsers = await this.models.User.insertMany(users);
        console.log('Users created:', createdUsers);

        // Autos
        const autos = createdUsers.map((user, i) => ({
            number: `AUTO${i + 1}`,
            model: `Model${i + 1}`,
            bodyType: i % 2 === 0 ? 'Sedan' : 'SUV',
            userId: user._id,
        }));
        const createdAutos = await this.models.Auto.insertMany(autos);
        console.log('Autos created:', createdAutos);

        // ParkingSpots
        const parkingSpots = Array.from({ length: 10 }, (_, i) => ({
            price: 100 + i * 10,
            isFree: i % 2 === 0,
            number: `Spot${i + 1}`,
        }));
        const createdParkingSpots = await this.models.ParkingSpot.insertMany(parkingSpots);
        console.log('Parking spots created:', createdParkingSpots);

        // NewsArticles
        const newsArticles = Array.from({ length: 10 }, (_, i) => ({
            title: `News Article ${i + 1}`,
            description: `Description for news article ${i + 1}`,
        }));
        const createdNewsArticles = await this.models.NewsArticle.insertMany(newsArticles);
        console.log('News articles created:', createdNewsArticles);

        console.log('Migration completed successfully.');
    }

    async findUserByGoogleId(googleId) {
        // Найти пользователя по Google ID
        const user = await this.models.User.findOne({ googleId });
        return user;
    }
    
    async createGoogleUser(userData) {
        // Создать нового пользователя с данными из Google профиля
        const newUser = new this.models.User({
            googleId: userData.googleId,
            email: userData.email,
            name: userData.name,
        });
    
        // Сохранить пользователя в базе
        await newUser.save();
        return newUser;
    }
    
}
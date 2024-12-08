const admin = require('firebase-admin');
const path = require('path');

// Подключаем файл конфигурации (замените путь на путь к вашему JSON-файлу)
const serviceAccount = require(path.join(__dirname, './caching-cd0f3-firebase-adminsdk-ci3r8-69440184f8.json'));

// Инициализируем Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://caching-cd0f3.firebaseio.com', // Замените `your-project-id` на ID вашего проекта
});

const db = admin.firestore(); // Для работы с Firestore

module.exports = { db }; // Используем CommonJS экспорт

import admin from 'firebase-admin';
import path from 'path';

// Подключаем файл конфигурации (замените путь на путь к вашему JSON-файлу)
const serviceAccount = require(path.join(__dirname, './caching-cd0f3-firebase-adminsdk-ci3r8-3b0b138ac2.json'));

// Инициализируем Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://caching-cd0f3.firebaseio.com', // Замените `your-project-id` на ID вашего проекта
});

const db = admin.firestore(); // Для работы с Firestore
const auth = admin.auth(); // Для работы с аутентификацией

export { db, auth };

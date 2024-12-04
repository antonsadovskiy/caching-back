import type {Request, Response} from "express";
import express, {Express} from "express";
import dotenv from "dotenv";
import cors from "cors";
import {createClient, RedisClientType} from "redis";
import { db } from './firebaseConfig';
import {fetchDataFromCache} from "./services/request.service";

const bodyParser = require('body-parser')
const dbLocal = require('./queries')

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors(), bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cacheClient: RedisClientType<Record<string, never>> = createClient();


(async () => {
    await cacheClient.connect();
})();



app.use(express.json());

app.get("/users", async (req: Request, res: Response): Promise<void> => {
    try {
        const { cacheKey, dataFromCache } = await fetchDataFromCache('users', cacheClient, req);

        if (dataFromCache) {
            res.status(200).json({
                meta: "from cache",
                data: JSON.parse(dataFromCache),
            });
            return;
        }

        const snapshot = await db.collection('users').get();

        if (snapshot.empty) {
            res.status(404).json({ message: 'No users found' });
            return;
        }

        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({
            meta: "from queries",
            data: users,
        });

        await cacheClient.setEx(cacheKey, 10, JSON.stringify(users));
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get("/posts", dbLocal.getPosts)
app.get("/photos", dbLocal.getPhotos)
app.get("/comments", dbLocal.getComments)
app.get("/todos", dbLocal.getTodos)

/*
app.get('/users', dbLocal.getUsers);
app.delete('/users/:id', dbLocal.deleteUser);
app.get('/users/:id/messages', dbLocal.getUserMessages);
*/

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

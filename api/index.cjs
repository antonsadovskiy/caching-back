const { createServer } = require("http");
const { parse } = require("url");
const express = require("express");
const cors = require("cors");
const bodyParser =require("body-parser");
// import {createClient} from "redis";
// import {fetchDataFromCache} from "./request.service.js";
const pkg = require('./firebaseConfig.cjs');
const {db} = pkg;

const app = express();
app.use(express.json());

app.use(cors(), bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const cacheClient = createClient();

/*(async () => {
    await cacheClient.connect();
})();*/

app.get("/", (req, res) => {
    res.json({ message: "Serverless API working!" });
});

app.get("/users", async (req, res) => {
    try {/*
        const { cacheKey, dataFromCache } = await fetchDataFromCache('users', cacheClient, req);

        if (dataFromCache) {
            res.status(200).json({
                meta: "from cache",
                data: JSON.parse(dataFromCache),
            });
            return;
        }*/

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

        // await cacheClient.setEx(cacheKey, 10, JSON.stringify(users));
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(3001, () => console.log("Server ready on port 3001."));

// Use export default instead of module.exports
module.exports = (req, res) => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        app(req, res, parsedUrl);
    });
    server.emit("request", req, res);
};
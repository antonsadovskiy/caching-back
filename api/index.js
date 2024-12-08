const { createServer } = require("http");
const { parse } = require("url");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Serverless API working!" });
});

app.get("/users", (req, res) => {
    res.json({ users: ["User1", "User2", "User3"] });
});

// Экспорт функции, как требуется Vercel
module.exports = (req, res) => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        app(req, res, parsedUrl);
    });
    server.emit("request", req, res);
};

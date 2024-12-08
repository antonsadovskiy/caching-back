import type {Request, Response} from "express";

import {createClient, RedisClientType} from "redis";
import {fetchDataFromCache} from "../services/request.service";

const Pool = require('pg').Pool

const cacheClient: RedisClientType<Record<string, never>> = createClient();

(async () => {
  await cacheClient.connect();
})();

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'cachingdb',
  password: 'password',
  port: 5432,
})

export const getUsers = async (req: Request, res: Response) => {
  try {
    const {cacheKey, dataFromCache} = await fetchDataFromCache('users', cacheClient, req)

    if (dataFromCache) {
      res.send({
        meta: "from cache",
        data: JSON.parse(dataFromCache),
      });
      return;
    }

    pool.query('SELECT * FROM users', async (error: Error, results: any) => {
      if (error) {
        throw error
      }
      res.status(200).json({
        meta: "from queries",
        data: results.rows
      })

      await cacheClient.setEx(cacheKey, 30, JSON.stringify(results.rows));
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getUserMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user:${userId}`;
    const dataFromCache = await cacheClient.get(cacheKey);

    if (dataFromCache) {
      res.send({
        meta: "from cache",
        data: JSON.parse(dataFromCache),
      });
      return;
    }

    pool.query(
      `SELECT m.messageInfo, m.date, u.email AS receiverEmail
         FROM messages m
         JOIN users u ON m.receiverId = u.id
         WHERE m.senderId = $1`,
      [userId],
      async (messageError: Error, messageResults: any) => {
        if (messageError) {
          throw messageError;
        }

        const messages = messageResults.rows;

        res.status(200).json({
          meta: "from queries",
          data: messages
        });

        // Кэшируем сообщения
        await cacheClient.setEx(cacheKey, 30, JSON.stringify(messages));
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    pool.query('DELETE FROM users WHERE id = $1', [req.params.id], (error: Error) => {
      if (error) {
        throw error;
      }

      // Выполняем запрос для получения обновленного массива пользователей
      pool.query('SELECT * FROM users', (selectError: Error, results: any) => {
        if (selectError) {
          throw selectError;
        }

        res.status(200).json({ message: `User deleted with ID: ${req.params.id}`, data: results.rows });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const addUser = async (req: Request, res: Response) => {
  const {name, email} = req.body;

  try {
    pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error: Error, results: any) => {
      if (error) {
        throw error
      }
      res.status(201).send(`User added with ID: ${results.insertId}`)
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {getUsers, addUser, deleteUser, getUserMessages};
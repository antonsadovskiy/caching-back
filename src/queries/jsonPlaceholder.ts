import type {Request, Response} from "express";

import {createClient, RedisClientType} from "redis";
import {fetchDataFromCache} from "../services/request.service";

const cacheClient: RedisClientType<Record<string, never>> = createClient();

(async () => {
  await cacheClient.connect();
})();


export const getPosts = async (req: Request, res: Response) => {
  console.time('getPosts');
  try {
    const {cacheKey, dataFromCache} = await fetchDataFromCache('posts', cacheClient, req)

    if (dataFromCache) {
      console.timeEnd('getPosts');
      res.send({
        meta: "from cache",
        data: JSON.parse(dataFromCache),
      });
      return;
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    const data = await response.json()

    res.send({
      meta: "from queries",
      data
    })
    await cacheClient.setEx(cacheKey, 10, JSON.stringify(data));
    console.timeEnd('getPosts');
  } catch (err) {
    console.timeEnd('getPosts');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPhotos = async (req: Request, res: Response) => {
  try {
    const {cacheKey, dataFromCache} = await fetchDataFromCache('photos', cacheClient, req)

    if (dataFromCache) {
      res.send({
        meta: "from cache",
        data: JSON.parse(dataFromCache),
      });
      return;
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/photos')
    const data = await response.json()

    res.send({
      meta: "from queries",
      data
    })
    await cacheClient.setEx(cacheKey, 10, JSON.stringify(data));

  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getTodos = async (req: Request, res: Response) => {
  try {
    const {cacheKey, dataFromCache} = await fetchDataFromCache('todos', cacheClient, req)

    if (dataFromCache) {
      res.send({
        meta: "from cache",
        data: JSON.parse(dataFromCache),
      });
      return;
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/todos')
    const data = await response.json()

    res.send({
      meta: "from queries",
      data
    })
    await cacheClient.setEx(cacheKey, 10, JSON.stringify(data));

  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


export const getComments = async (req: Request, res: Response) => {
  try {
    const {cacheKey, dataFromCache} = await fetchDataFromCache('comments', cacheClient, req)

    if (dataFromCache) {
      res.send({
        meta: "from cache",
        data: JSON.parse(dataFromCache),
      });
      return;
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/comments')
    const data = await response.json()

    res.send({
      meta: "from queries",
      data
    })
    await cacheClient.setEx(cacheKey, 10, JSON.stringify(data));

  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {getPosts, getPhotos, getComments, getTodos};
import { RedisClientType } from "redis";
import type { Request, Response } from "express";

export type DataType = 'photos' | 'posts' | 'comments' | 'albums' | 'todos' | 'users';

export const fetchDataFromCache = async (
  data: DataType,
  cacheClient: RedisClientType<any>,
  req?: Request
) => {
  const id = req?.params.id;

  const cacheKey = id ? `${data}/${id}` : `${data}`;
  const dataFromCache = await cacheClient.get(cacheKey);

  return {
    dataFromCache,
    cacheKey
  }
};

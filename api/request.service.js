export const fetchDataFromCache = async (
  data,
  cacheClient,
  req
) => {
  const id = req?.params.id;

  const cacheKey = id ? `${data}/${id}` : `${data}`;
  const dataFromCache = await cacheClient.get(cacheKey);

  return {
    dataFromCache,
    cacheKey
  }
};

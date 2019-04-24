import { MongoClient, Db } from 'mongodb';
import { getMongoDbConfig } from './config';
import { getLoggerFor } from './logger';

let db:Db|null = null




const connect = async () : Promise<Db> => {
  const { database, connectionUrl } = await getMongoDbConfig();
  const mongodb = await MongoClient.connect(connectionUrl, { useNewUrlParser: true });
  return mongodb.db(database);
}




export const mongoBoot = async () => {
  const logger = await getLoggerFor(`infra`, `mongo`, `mongoBoot`);
  logger.info(`Booting MongoDB`);
  db = await connect();
}




export const getCollection = async (collectionName:string) => {
  if(!db) throw new Error('MongoDB connection is not ready')
  return db.collection(collectionName)
}

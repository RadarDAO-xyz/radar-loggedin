import { MongoClient } from 'mongodb';

const DBClient = new MongoClient(process.env.MONGO_URL);

DBClient.connect();

export const DB = DBClient.db('radar');
export default DBClient;

import './types/global';
import { config } from 'dotenv';
config(); // Import .env file into process.env
import express from 'express';
import DBClient, { DB } from './util/db';
import { AddressInfo } from 'net';
import UserRouter from './paths/user';
import path from 'path';

const app = express();

app.use('/static', express.static(path.join(__dirname, '../static')));

app.use('/user', UserRouter);

app.use((req, res) => {
    res.status(404).end("Not Found");
});

DBClient.once('connectionReady', () => {
    console.log('MongoDB Ready');
});

// Start listening for requests once the DB is ready
const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${(server.address() as AddressInfo).port}`);
});

process.on('SIGKILL', () => {
    DBClient.close();
    server.close();
});

import './types/global';
import { config } from 'dotenv';
config(); // Import .env file into process.env
import express from 'express';
import DBClient from './util/db';
import { AddressInfo } from 'net';
import UserRouter from './paths/user';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import minify from 'express-minify';
import cors from 'cors';
import ChannelRouter from './paths/channels';
import DiscussionRouter from './paths/discussions';

const app = express();

app.use(cors());

app.use(
    minify({
        cache: false, // Caching in memory
        js_match: /.+\.js/
    })
);
app.use('/static', express.static(path.join(__dirname, '../static')));

app.use('/user', UserRouter);
app.use('/channels', ChannelRouter);
app.use('/discussions', DiscussionRouter);

app.use((req, res) => {
    res.status(404).end('Not Found');
});

DBClient.once('connectionReady', () => {
    console.log('MongoDB Ready');
});

process.on('SIGTERM', () => {
    DBClient.close();
    server.close();
});

const hostDev = () => {
    return app.listen(process.env.PORT);
};

const hostProd = () => {
    http.createServer((req, res) => {
        res.writeHead(302, 'Found', { Location: `https://${req.headers.host}${req.url}` }).end();
    }).listen(80);

    return https
        .createServer(
            {
                cert: fs.readFileSync(path.join(__dirname, '../certificate.crt')),
                key: fs.readFileSync(path.join(__dirname, '../private.key')),
                ca: [fs.readFileSync(path.join(__dirname, '../ca_bundle.crt'))]
            },
            app
        )
        .listen(443);
};

const server = process.env.NODE_ENV === 'production' ? hostProd() : hostDev();

server.on('listening', () => {
    console.log(`Listening on port ${(server.address() as AddressInfo).port}`);
});

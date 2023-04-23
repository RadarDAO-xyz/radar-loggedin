import { Router, json } from 'express';
import { insertThread, normaliseThreads } from '../util/AirtableUtil';
import AirtableBase from '../util/airtable';
import DiscordClient from '../util/discord';
import { ForumChannel, ThreadChannel, Webhook } from 'discord.js';
import fetch, { Headers } from 'node-fetch';
import { RawUserData } from 'discord.js/typings/rawDataTypes';

const DiscussionRouter = Router();

const SillyCache = new Map();

setInterval(() => {
    SillyCache.clear();
}, 120_000); // 2 minutes

DiscussionRouter.get('/', async (req, res) => {
    console.log('Fetching postable channels');

    if (SillyCache.has(req.originalUrl)) {
        console.log('Serving cached data');
        return res.status(200).json(SillyCache.get(req.originalUrl)).end();
    }

    console.log('Querying data from Airtable');

    const q = req.query.q;
    const channelId = req.query.channelId;

    const formulas = [];
    if (q) {
        formulas.push(`FIND(LOWER('${q}'), LOWER({Thread Name}))`);
    }
    if (channelId) {
        formulas.push(`{channelId} = '${channelId}'`);
    }

    console.log(formulas.length > 0 ? `AND(${formulas.join(', ')})` : 'TRUE()');

    const data = await AirtableBase('Table 1')
        .select({
            filterByFormula: formulas.length > 0 ? `AND(${formulas.join(', ')})` : 'TRUE()'
        })
        .firstPage()
        .then(x => normaliseThreads(x))
        .then(x => x.slice(0, 25));

    SillyCache.set(req.originalUrl, data);

    console.log('Serving queried data');
    res.status(200).json(data).end();
});

DiscussionRouter.use(json());

declare module 'express-serve-static-core' {
    export interface Request {
        forum?: ForumChannel;
        user?: RawUserData;
        webhook?: Webhook;
    }
}

DiscussionRouter.use('/:forumId', async (req, res, next) => {
    if (!req.headers.authorization) return res.status(400).end();

    if (!req.body.url || !req.body.reason || !req.body.keywords || req.body.keywords.length == 0) {
        return res.sendStatus(401).end();
    }

    const headers = new Headers();
    headers.set('Authorization', req.headers.authorization as string);
    const user = (await fetch('https://discord.com/api/v9/users/@me', {
        headers
    }).then(res => res.json())) as RawUserData;
    if (!user || !user.id) return res.status(401).end();

    const member = await DiscordClient.guilds.cache
        .get('913873017287884830')
        ?.members.fetch(user.id);

    if (!member) return res.status(403).end();

    const forumChannel = (await DiscordClient.channels.fetch(req.params.forumId)) as ForumChannel;

    let webhook = await forumChannel
        .fetchWebhooks()
        .then(ws => ws.filter(w => w.owner?.id === DiscordClient.user?.id).first());

    if (!webhook) {
        webhook = await forumChannel.createWebhook({
            name: 'PosterHook'
        });
    }

    req.forum = forumChannel;
    req.user = user;
    req.webhook = webhook;
    next();
});

DiscussionRouter.post('/:forumId/:threadId', async (req, res) => {
    const threadChannel = (await DiscordClient.channels.fetch(
        req.params.threadId
    )) as ThreadChannel;
    const webhook = req.webhook as Webhook;
    const user = req.user as RawUserData;
    const message = await webhook.send({
        content: `${req.body.url}\n\n${req.body.reason}\n\n${(req.body.keywords as string[])
            .map(x => `\`${x}\``)
            .join(' ')}`,
        username: user.username,
        avatarURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
        threadId: threadChannel.id
    });

    res.status(200).json(message.toJSON()).end();
});

DiscussionRouter.post('/:forumId', async (req, res) => {
    if (!req.body.title) {
        res.sendStatus(401).end();
    }
    const webhook = req.webhook as Webhook;
    const user = req.user as RawUserData;
    const message = await webhook.send({
        content: `${req.body.url}\n\n${req.body.reason}\n\n${(req.body.keywords as string[])
            .map(x => `\`${x}\``)
            .join(' ')}`,
        username: user.username,
        avatarURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
        threadName: req.body.title
    });

    await insertThread(
        message.channel as ThreadChannel,
        req.forum as ForumChannel,
        req.body.keywords as string[],
        user
    );

    res.status(200).json(message.toJSON()).end();
});

export default DiscussionRouter;

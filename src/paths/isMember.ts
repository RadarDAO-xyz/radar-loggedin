import { Router } from 'express';
import DiscordClient from '../util/discord';

const isMemberRouter = Router();

const SillyCache = new Map();

setInterval(() => {
    SillyCache.clear();
}, 120_000); // 2 minutes

isMemberRouter.get('/:id', async (req, res) => {
    const member = await DiscordClient.guilds.cache.get('913873017287884830')?.members.fetch(req.params.id);

    res.status(200).json({ is_member: !!member }).end();
});

export default isMemberRouter;
